import type { AccessTokenRecord } from 'ltijs';

export interface AccessTokenWrapper {
  id: string;
  platformUrl: string;
  clientId: string;
  scopes: string;
  token: AccessTokenRecord;
  expiresAt: Date;
}
