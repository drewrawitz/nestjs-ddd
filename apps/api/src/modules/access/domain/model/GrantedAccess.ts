export class GrantedAccess {
  constructor(
    public readonly props: {
      userId: string;
      grantedBy: string;
      productId: string;
      startDate: Date;
      endDate: Date | null;
    },
  ) {}

  get productId() {
    return this.props.productId;
  }

  isActive(): boolean {
    const now = new Date();

    if (this.props.endDate && this.props.endDate < now) {
      return false;
    }

    return this.props.startDate <= now;
  }

  get expiresAt(): Date | null {
    return this.props.endDate;
  }
}
