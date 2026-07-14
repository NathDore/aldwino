export type HealthState = "ok";

export class HealthStatus {
  private constructor(
    public readonly state: HealthState,
    public readonly checkedAt: Date,
  ) {}

  static create(params: { checkedAt: Date }): HealthStatus {
    return new HealthStatus("ok", params.checkedAt);
  }

  toJSON() {
    return { status: this.state, checkedAt: this.checkedAt.toISOString() };
  }
}
