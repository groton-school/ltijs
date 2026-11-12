# @groton/ltijs-google-cloud-logging

An ltijs Logger for Google Cloud Logging

## Install

```bash
pnpm install ltijs @groton/ltijs-google-cloud-logging
```

## Use

```ts
import { GoogleCloudLogger } from '@groton/ltijs-google-cloud-logging';
import { Provider } from 'ltijs';

const provider = new Provider({
  // logName is optional
  logger: new GoogleCloudLogger({ logName: 'lti' })
});

// ...

await provider.listen({});
```
