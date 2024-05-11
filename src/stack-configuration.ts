import * as pulumi from '@pulumi/pulumi';

export class StackConfiguration {
  constructor(
    readonly vpcIpRange: string,
    readonly projectName: string,
    readonly environment: string,
    readonly region: string,
    readonly version: string,
    readonly highAvailableControlPlane: boolean,
    readonly defaultNodePoolSize: string,
    readonly defaultNodePoolCount: number,
    readonly ingressNodePoolSize: string,
    readonly ingressNodePoolMinCount: number,
    readonly ingressNodePoolMaxCount: number
  ) {}

  public static load() {
    const config = new pulumi.Config();
    return new StackConfiguration(
      config.require('vpcIpRange'),
      pulumi.getProject(),
      pulumi.getStack(),
      config.require('region'),
      config.require('version'),
      config.requireBoolean('high-available-control-plane'),
      config.require('default-nodepool-size'),
      config.requireNumber('default-nodepool-count'),
      config.require('ingress-nodepool-size'),
      config.requireNumber('ingress-nodepool-min-count'),
      config.requireNumber('ingress-nodepool-max-count')
    );
  }
}
