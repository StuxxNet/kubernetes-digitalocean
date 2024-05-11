import * as pulumi from '@pulumi/pulumi';
import { type Provider } from '@pulumi/kubernetes';
import { type Utils } from './utils';
import { type GoDaddyConfiguration } from './godaddy-configuration';
import * as kubernetes from '@pulumi/kubernetes';

export class ExternalDNS extends pulumi.ComponentResource {
  constructor(
    private readonly utils: Utils,
    private readonly provider: Provider,
    private readonly goDaddyConfiguration: GoDaddyConfiguration,
    opts: pulumi.ComponentResourceOptions
  ) {
    const nameOfExternalDnsResource = `${utils.getResourcesBaseName()}-external-dns`;
    super('easy-k8s:external-dns', nameOfExternalDnsResource, {}, opts);

    this.deployExternalDns(
      this.provider,
      this.utils,
      this.goDaddyConfiguration
    );
  }

  private deployExternalDns(
    provider: Provider,
    utils: Utils,
    goDaddyConfiguration: GoDaddyConfiguration
  ) {
    const nameofExternalDnsHelmRelease = `easy-k8s-external-dns`;
    new kubernetes.helm.v3.Release(
      nameofExternalDnsHelmRelease,
      {
        chart: 'external-dns',
        version: '1.14.4',
        repositoryOpts: {
          repo: 'https://kubernetes-sigs.github.io/external-dns',
        },
        createNamespace: true,
        namespace: 'external-dns',
        values: this.getExternalDnsHelmValues(goDaddyConfiguration),
      },
      {
        provider: provider,
        parent: this,
      }
    );
  }

  private getExternalDnsHelmValues(
    goDaddyConfiguration: GoDaddyConfiguration
  ): object {
    return {
      logLevel: 'info',
      logFormat: 'json',
      interval: '1m',
      domainFilters: [goDaddyConfiguration.domainFilter],
      provider: {
        name: 'godaddy',
      },
      extraArgs: [
        '--source=service',
        `--godaddy-api-key=${goDaddyConfiguration.apiKey}`,
        `--godaddy-api-secret=${goDaddyConfiguration.apiSecret}`,
      ],
    };
  }
}
