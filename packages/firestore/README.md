# @groton/ltijs-firestore

Google Cloud Firestore DatabaseManager for ltijs

## Install

```bash
pnpm install ltijs @groton/ltijs-firestore
```

## Use

```ts
import { FirestoreDatabaseManager } from '@groton/ltijs-firestore';
import { Provider } from 'ltijs';

const provider = new Provider({
  //
  databaseManager: new FirestoreDatabaseManager({ basePath: 'lti/data' })
});

// ...

provider.listen({});
```

## Configure

The database manager maintains four collections in Firestore: `platform`, `accessTokens`, `idTokens`, and `nonces`. Paths to these collections within your Firestore document hierarchy can be passed as `platformsPath`, `accessTokensPath`, `idTokensPath`, and/or `noncesPath` properties of the constructor options respectively.

While you can configure each path individually, you can also use the default collection names and a `basePath` to these collections in your Firestore document hierarchy -- or both a `basePath` and custom collection paths from that `basePath`.

Internal identifiers are the document ID values for each record.
