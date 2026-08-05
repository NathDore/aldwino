import { WorkSession } from "../../domain/workSession/WorkSession";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";

export class GetWorkSessionByIdUseCase {
  constructor(private readonly repository: IWorkSessionRepository) {}

  execute(id: string): WorkSession | null {
    return this.repository.getById(id);
  }
}
