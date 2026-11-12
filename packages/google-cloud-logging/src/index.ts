import { Log, Logging } from '@google-cloud/logging';
import type { LogSeverity } from '@google-cloud/logging/build/src/entry.js';
import { Logger } from 'ltijs';

type Options = {
  logName?: string;
};

export class GoogleCloudLogger implements Logger {
  private log: Log;

  public constructor({ logName = 'lti' }: Options = {}) {
    const logging = new Logging({
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
    this.log = logging.log(logName);
  }

  private async entry(
    severity: LogSeverity,
    component: string,
    message: string
  ) {
    await this.log.write(
      this.log.entry(
        {
          resource: { type: 'global', labels: { component } },
          severity
        },
        message
      )
    );
  }

  public async debug(component: string, message: string) {
    await this.entry('DEBUG', component, message);
  }

  public async warn(component: string, message: string) {
    await this.entry('WARN', component, message);
  }

  public async error(component: string, message: string) {
    await this.entry('ERROR', component, message);
  }
}
