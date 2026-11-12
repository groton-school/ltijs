import type { IdToken, IdTokenClaims } from 'ltijs';
import type { LTIaaSToken } from './LTIaaSToken.js';

export interface LTIaaSManager {
  /**
   * Save a new {@link LTIaaSToken}
   *
   * Called by the LTI as the final step of an LTI launch
   *
   * @returns the {@link LTIaaSToken.id} value
   */
  saveLTIaaSToken(idToken: IdToken, redirectTo: string): Promise<string>;

  /**
   * Consume an {@link LTIaaSToken}
   *
   * Handoff token is deleted from the database, if present, and converted back
   * into an {@link IdToken}.
   *
   * Called by the app receiving the user IdToken to authenticate the user.
   *
   * @returns `undefined` if LTIaaSToken has already been consumed or is
   *   otherwise unavailable, or the IdToken `claims`
   */
  consumeLTIaaSToken(
    id: string
  ): Promise<{ claims: IdTokenClaims; redirectTo: string } | undefined>;
}
