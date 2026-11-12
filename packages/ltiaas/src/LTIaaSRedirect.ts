interface Options {
  app: string;
  endpoint?: string;
  ltiaasToken: string;
  redirect?: string;
}

export class LTIaaSRedirect {
  public queryParam() {
    return 'ltiaas';
  }

  public buildAppUrl({ app, endpoint, ltiaasToken, redirect = '/' }: Options) {
    return `${app.replace(/\/*$/, '')}${
      endpoint ? `/${endpoint.replace(/^\/*(.+)\/*$/, '$1')}` : ''
    }?${this.queryParam()}=${encodeURIComponent(ltiaasToken)}`;
  }
}
