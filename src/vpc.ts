import { Vpc as NetworkVpc } from '@pulumi/digitalocean/vpc';
import * as pulumi from '@pulumi/pulumi';

import { type StackConfiguration } from './stack-configuration';
import { type Utils } from './utils';

export class Vpc extends pulumi.ComponentResource {
  private vpc: NetworkVpc;

  constructor(
    utils: Utils,
    stackConfiguration: StackConfiguration,
    opts: pulumi.ComponentResourceOptions
  ) {
    const nameOfVpcComponentResource = `${utils.getResourcesBaseName()}-component-resource-vpc`;
    super('easy-k8s:network', nameOfVpcComponentResource, {}, opts);
    this.vpc = this.createNetworkVpc(stackConfiguration.vpcIpRange, utils);
  }

  private createNetworkVpc(vpcIpRange: string, utils: Utils): NetworkVpc {
    const nameOfVpcResource = `${utils.getResourcesBaseName()}-resource-vpc`;
    return new NetworkVpc(
      nameOfVpcResource,
      {
        name: nameOfVpcResource,
        ipRange: vpcIpRange,
        region: 'fra1',
      },
      {
        parent: this,
      }
    );
  }

  public getVpcId(): pulumi.Output<string> {
    return this.vpc.id;
  }
}
