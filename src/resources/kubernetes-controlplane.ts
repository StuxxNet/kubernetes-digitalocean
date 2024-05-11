import { KubernetesCluster } from '@pulumi/digitalocean/kubernetesCluster';
import * as pulumi from '@pulumi/pulumi';
import { Provider } from '@pulumi/kubernetes';

import { type StackConfiguration } from '../stack-configuration';
import { type Utils } from '../utils';

export interface KubernetesControlPlaneParameters {
  region: string;
  vpcUuid: pulumi.Output<string>;
  version: string;
  defaultNodePoolSize: string;
  defaultNodesCount: number;
  highAvailable?: boolean;
}

export class KubernetesControlPlane extends pulumi.ComponentResource {
  private readonly kubernetesControlPlane: KubernetesCluster;
  private utils: Utils;

  constructor(
    vpcUuid: pulumi.Output<string>,
    utils: Utils,
    stackConfiguration: StackConfiguration,
    opts: pulumi.ComponentResourceOptions
  ) {
    const nameOfControlPlaneComponent = `${utils.getResourcesBaseName()}-component-resource-controlplane`;
    super('easy-k8s:controlplane', nameOfControlPlaneComponent, {}, opts);
    this.utils = utils;
    this.kubernetesControlPlane = this.createKubernetesControlPlane({
      region: stackConfiguration.region,
      vpcUuid: vpcUuid,
      version: stackConfiguration.version,
      defaultNodesCount: stackConfiguration.defaultNodePoolCount,
      defaultNodePoolSize: stackConfiguration.defaultNodePoolSize,
      highAvailable: stackConfiguration.highAvailableControlPlane,
    });
  }

  private createKubernetesControlPlane(
    kubernetesControlPlaneParameters: KubernetesControlPlaneParameters
  ): KubernetesCluster {
    const nameOfKubernetesClusterResource = `${this.utils.getResourcesBaseName()}-kubernetes-controlplane`;
    return new KubernetesCluster(
      nameOfKubernetesClusterResource,
      {
        name: nameOfKubernetesClusterResource,
        version: kubernetesControlPlaneParameters.version,
        region: kubernetesControlPlaneParameters.region,
        vpcUuid: kubernetesControlPlaneParameters.vpcUuid,
        ha: kubernetesControlPlaneParameters.highAvailable || false,
        nodePool: {
          name: `${this.utils.getResourcesBaseName()}-default-nodepool`,
          size: kubernetesControlPlaneParameters.defaultNodePoolSize,
          nodeCount: kubernetesControlPlaneParameters.defaultNodesCount,
          tags: this.utils.getDefaultTags(),
        },
        tags: this.utils.getDefaultTags(),
      },
      {
        parent: this,
      }
    );
  }

  public getKubernetesControlPlaneId(): pulumi.Output<string> {
    return this.kubernetesControlPlane.id;
  }

  public getKubernetesProvider(utils: Utils): Provider {
    const nameOfKubernetesProvider = `${utils.getResourcesBaseName()}-kubernetes-provider`;
    return new Provider(
      nameOfKubernetesProvider,
      {
        kubeconfig: this.kubernetesControlPlane.kubeConfigs[0].rawConfig,
      },
      {
        parent: this,
      }
    );
  }
}
