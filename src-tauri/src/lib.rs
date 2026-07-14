use std::sync::Mutex;
use tauri::Manager;

struct SidecarState(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_variables)]
    let setup = |app: &mut tauri::App| {
        #[cfg(not(debug_assertions))]
        {
            use tauri_plugin_shell::process::CommandEvent;
            use tauri_plugin_shell::ShellExt;

            let (mut rx, child) = app
                .shell()
                .sidecar("app-api")
                .expect("failed to create app-api sidecar command")
                .spawn()
                .expect("failed to spawn app-api sidecar");

            app.state::<SidecarState>().0.lock().unwrap().replace(child);

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            log::info!("[app-api] {}", String::from_utf8_lossy(&line))
                        }
                        CommandEvent::Stderr(line) => {
                            log::error!("[app-api] {}", String::from_utf8_lossy(&line))
                        }
                        CommandEvent::Error(err) => log::error!("[app-api] error: {err}"),
                        CommandEvent::Terminated(payload) => {
                            log::warn!("[app-api] exited: {:?}", payload)
                        }
                        _ => {}
                    }
                }
            });
        }
        Ok(())
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(setup)
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(child) = app_handle.state::<SidecarState>().0.lock().unwrap().take() {
                    let _ = child.kill();
                }
            }
        });
}
