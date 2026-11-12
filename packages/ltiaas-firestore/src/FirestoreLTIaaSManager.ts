import nodePath from 'node:path';
import { Collection, CollectionOptions } from '@battis/lazy-firestore';
import { DateConverter } from '@battis/lazy-firestore/converters/Date';
import { FirestoreDatabaseManager } from '@groton/ltijs-firestore';
import { LTIaaSManager, LTIaaSToken } from '@groton/ltijs-ltiaas';
import { DatabaseManager, IdToken, IdTokenClaims } from 'ltijs';

interface Options extends CollectionOptions {
  databaseManager?: DatabaseManager;
}

export class FirestoreLTIaaSManager
  extends Collection<LTIaaSToken>
  implements LTIaaSManager
{
  private databaseManager: DatabaseManager;

  public constructor({
    path = 'ltiaasTokens',
    databaseManager,
    ...options
  }: Options) {
    super({ path, ...options, converter: { expiresAt: DateConverter } });
    this.databaseManager =
      databaseManager ||
      new FirestoreDatabaseManager({
        db: this.db,
        basePath: nodePath.dirname(path)
      });
  }

  public queryParam() {
    return 'ltiaas';
  }

  public async saveLTIaaSToken(
    idToken: IdToken,
    redirectTo: string
  ): Promise<string> {
    return (
      await this.create({
        data: new LTIaaSToken(idToken.id, redirectTo),
        strict: true
      })
    ).ref.id;
  }

  public async consumeLTIaaSToken(
    id: string
  ): Promise<{ claims: IdTokenClaims; redirectTo: string } | undefined> {
    const { idTokenId, expiresAt, redirectTo } =
      (await this.delete({ id, strict: false })).data || {};
    if (idTokenId && redirectTo && expiresAt && expiresAt > new Date()) {
      const claims = await this.databaseManager.getIdToken(idTokenId);
      if (claims) {
        return { claims, redirectTo };
      }
    }
    return undefined;
  }
}
