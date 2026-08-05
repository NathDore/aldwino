import { WorkSession } from "../../domain/workSession/WorkSession";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";

export class ListWorkSessionsUseCase {
  constructor(private readonly repository: IWorkSessionRepository) {}

  execute(): WorkSession[] {
    return this.repository.getAll();
  }
}
