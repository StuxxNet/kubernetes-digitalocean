import * as pulumi from '@pulumi/pulumi';

export class GoDaddyConfiguration {
  constructor(
    readonly apiKey: string,
    readonly apiSecret: string,
    readonly domainFilter: string
  ) {}

  public static load() {
    const config = new pulumi.Config();

    if (!process.env.GO_DADDY_API_KEY) {
      console.log('Please set GO_DADDY_API_KEY environment variable');
      throw new Error();
    }
    if (!process.env.GO_DADDY_API_SECRET) {
      console.log('Please set GO_DADDY_API_SECRET environment variable');
      throw new Error();
    }

    return new GoDaddyConfiguration(
      process.env.GO_DADDY_API_KEY,
      process.env.GO_DADDY_API_SECRET,
      config.require('go-daddy-domain-filter')
    );
  }
}
