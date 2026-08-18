import { WORK_SESSION_COMPLETION_MESSAGES } from "../../domain/workSession/WorkSessionCompletionMessages";

export class GetRandomWorkSessionCompletionMessageUseCase {
  execute(): { message: string } {
    const index = Math.floor(Math.random() * WORK_SESSION_COMPLETION_MESSAGES.length);
    return { message: WORK_SESSION_COMPLETION_MESSAGES[index] };
  }
}
