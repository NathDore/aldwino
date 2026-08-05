import { WorkSession } from "../../domain/workSession/WorkSession";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";

export interface WorkSessionMergeResult {
  session: WorkSession;
  mergedFrom: string[];
}

export class WorkSessionMergeService {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly assignmentWorkSessionRepository: IAssignmentWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly clock: Clock,
  ) {}

  checkAndMerge(params: { startTime: Date; endTime: Date; self?: WorkSession }): WorkSessionMergeResult | null {
    const overlaps = this.repository.findOverlappingInProgress(params.startTime, params.endTime, params.self?.id);
    if (overlaps.length === 0) {
      return null;
    }

    const originals = params.self ? [params.self, ...overlaps] : overlaps;

    const start = originals.reduce((min, o) => (o.startTime < min ? o.startTime : min), params.startTime);
    const end = originals.reduce((max, o) => (o.endTime > max ? o.endTime : max), params.endTime);

    const inProgressState = this.workSessionStateRepository.findByState("INPROGRESS");
    if (!inProgressState) {
      throw new WorkSessionStateNotFoundError("INPROGRESS");
    }

    const now = this.clock.now();

    for (const original of originals) {
      this.repository.update(
        WorkSession.create({
          id: original.id,
          workSessionStateId: original.workSessionStateId,
          startTime: original.startTime,
          endTime: original.endTime,
          completedAt: original.completedAt,
          isDeleted: true,
          deletedAt: now,
          createdAt: original.createdAt,
        }),
      );
    }

    const merged = this.repository.create(
      WorkSession.create({
        id: crypto.randomUUID(),
        workSessionStateId: inProgressState.id,
        startTime: start,
        endTime: end,
        completedAt: null,
        createdAt: now,
      }),
    );

    const seenAssignmentIds = new Set<string>();
    for (const original of originals) {
      for (const link of this.assignmentWorkSessionRepository.getByWorkSessionId(original.id)) {
        this.assignmentWorkSessionRepository.update(
          AssignmentWorkSession.create({
            id: link.id,
            assignmentId: link.assignmentId,
            workSessionId: link.workSessionId,
            isDeleted: true,
            deletedAt: now,
            createdAt: link.createdAt,
          }),
        );
        if (!seenAssignmentIds.has(link.assignmentId)) {
          seenAssignmentIds.add(link.assignmentId);
          this.assignmentWorkSessionRepository.create(
            AssignmentWorkSession.create({
              id: crypto.randomUUID(),
              assignmentId: link.assignmentId,
              workSessionId: merged.id,
              createdAt: now,
            }),
          );
        }
      }
    }

    return { session: merged, mergedFrom: originals.map((o) => o.id) };
  }
}
