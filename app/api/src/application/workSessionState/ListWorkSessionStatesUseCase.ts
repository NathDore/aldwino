import { WorkSessionState } from "../../domain/workSessionState/WorkSessionState";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";

export class ListWorkSessionStatesUseCase {
  constructor(private readonly repository: IWorkSessionStateRepository) {}

  execute(): WorkSessionState[] {
    return this.repository.getAll();
  }
}
