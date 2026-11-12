import type { DatabaseManager, IdToken } from 'ltijs';

export class LTIaaSToken {
  public readonly expiresAt: Date;

  public constructor(
    /** database ID of {@link IdToken} in {@link DatabaseManager} */
    public readonly idTokenId: string,
    /** redirect URL within app */
    public readonly redirectTo: string
  ) {
    this.expiresAt = new Date(new Date().getTime() + 30000);
  }
}
