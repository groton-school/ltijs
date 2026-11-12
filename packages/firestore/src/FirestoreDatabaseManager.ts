import path from 'node:path';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';
import { requireUnique } from '@battis/lazy-firestore/directives/requireUnique';
import { Filter, Firestore } from '@google-cloud/firestore';
import type {
  AccessTokenRecord,
  DatabaseManager,
  IdTokenClaims,
  IdTokenRecord,
  PlatformAttributes,
  PlatformFilter,
  PlatformRecord
} from 'ltijs';
import type { AccessTokenWrapper } from './AccessTokenWrapper.js';

interface FirestoreDatabaseManagerOptions extends Omit<
  CollectionOptions,
  'path'
> {
  basePath?: string;
  platformsPath?: string;
  accessTokensPath?: string;
  idTokensPath?: string;
  noncesPath?: string;
}

export class FirestoreDatabaseManager implements DatabaseManager {
  private platforms;
  private accessTokens;
  private idTokens;
  private nonces;

  public constructor({
    db,
    databaseId = process.env.DATABASE,
    basePath = '.',
    platformsPath = 'platforms',
    accessTokensPath = 'accessTokens',
    idTokensPath = 'idTokens',
    noncesPath = 'nonces',
    firestore
  }: FirestoreDatabaseManagerOptions = {}) {
    db = db || new Firestore({ databaseId, ...firestore });
    this.platforms = new Collection<PlatformRecord>({
      db,
      path: path.join(/*turbopackIgnore: true*/ basePath, platformsPath)
    });
    this.accessTokens = new Collection<AccessTokenWrapper>({
      db,
      path: path.join(/*turbopackIgnore: true*/ basePath, accessTokensPath),
      converter: { expiresAt: DateConverter }
    });
    this.idTokens = new Collection<IdTokenRecord>({
      db,
      path: path.join(/*turbopackIgnore: true*/ basePath, idTokensPath)
    });
    this.nonces = new Collection<{ nonce: string }>({
      db,
      path: path.join(/*turbopackIgnore: true*/ basePath, noncesPath)
    });
  }

  public async listen(): Promise<void> {}

  public async close(): Promise<void> {}

  public async getPlatforms({
    url,
    name,
    clientId
  }: PlatformFilter = {}): Promise<PlatformRecord[]> {
    return (
      await this.platforms.list({
        query: (ref) =>
          ref.where(
            Filter.and(
              ...(url ? [Filter.where('url', '==', url)] : []),
              ...(name ? [Filter.where('name', '==', name)] : []),
              ...(clientId
                ? [
                    Filter.where(
                      'clientId',
                      'in',
                      Array.isArray(clientId) ? clientId : [clientId]
                    )
                  ]
                : [])
            )
          ),
        strict: false
      })
    ).map((doc) => doc.data);
  }

  public async getPlatformById(
    id: string
  ): Promise<PlatformRecord | undefined> {
    return (await this.platforms.read({ id, strict: false })).data ?? undefined;
  }

  public async getPlatformByUrlAndClientId(
    url: string,
    clientId: string
  ): Promise<PlatformRecord | undefined> {
    return (
      requireUnique({
        list: await this.platforms.list({
          query: (ref) =>
            ref.where('url', '==', url).where('clientId', '==', clientId),
          strict: false
        }),
        strict: false
      }).data ?? undefined
    );
  }

  public async savePlatform(platform: PlatformAttributes): Promise<string> {
    return (
      await this.platforms.create({
        injectId: 'id',
        data: platform as PlatformRecord,
        strict: true
      })
    ).ref.id;
  }

  public async updatePlatformById(
    id: string,
    patch: Partial<PlatformAttributes>
  ): Promise<void> {
    await this.platforms.update({ id, patch, strict: true });
  }

  public async deletePlatformById(id: string): Promise<void> {
    await this.platforms.delete({ id, strict: true });
  }

  public async getAccessToken(
    platformUrl: string,
    clientId: string,
    scopes: string
  ): Promise<AccessTokenRecord | undefined> {
    return (
      requireUnique({
        list: await this.accessTokens.list({
          query: (ref) =>
            ref
              .where('platformUrl', '==', platformUrl)
              .where('clientId', '==', clientId)
              .where('scopes', '==', scopes),
          strict: false
        }),
        strict: false
      }).data?.token ?? undefined
    );
  }

  public async saveAccessToken(
    platformUrl: string,
    clientId: string,
    scopes: string,
    token: AccessTokenRecord
  ): Promise<string> {
    return (
      await this.accessTokens.create({
        injectId: 'id',
        data: {
          platformUrl,
          clientId,
          scopes,
          token,
          expiresAt: new Date((token.createdAt + token.expires_in) * 1000)
        } as AccessTokenWrapper,
        strict: true
      })
    ).ref.id;
  }

  public async getIdToken(id: string): Promise<IdTokenRecord | undefined> {
    return (await this.idTokens.read({ id, strict: false })).data ?? undefined;
  }

  public async saveIdToken(token: IdTokenClaims): Promise<string> {
    return (
      await this.idTokens.create({
        injectId: 'id',
        data: token as IdTokenRecord,
        strict: true
      })
    ).ref.id;
  }

  public async saveNonce(nonce: string): Promise<string> {
    return (await this.nonces.create({ data: { nonce } })).ref.id;
  }

  public async consumeNonce(nonce: string): Promise<boolean> {
    return !!(
      await this.nonces.delete({
        query: (ref) => ref.where('nonce', '==', nonce),
        strict: false
      })
    ).data;
  }
}
