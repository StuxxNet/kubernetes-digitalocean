import { KubernetesNodePool as NodePool } from '@pulumi/digitalocean/kubernetesNodePool';
import * as pulumi from '@pulumi/pulumi';

import { type Utils } from '../utils';

export interface NodePoolParamaters {
  clusterId: pulumi.Output<string>;
  size: string;
  nodeCount: number;
  taints?: TaintsParameters[];
  tags: string[];
}

export interface TaintsParameters {
  key: string;
  value: string;
  effect: string;
}

export class KubernetesNodePool extends pulumi.ComponentResource {
  private readonly utils: Utils;

  constructor(utils: Utils, opts: pulumi.ComponentResourceOptions) {
    const nameOfNodePoolComponent = `${utils.getResourcesBaseName()}-component-resource-nodepool`;
    super('easy-k8s:nodepool', nameOfNodePoolComponent, {}, opts);
    this.utils = utils;
  }

  public createKubernetesNodePool(
    name: string,
    nodePoolParameters: NodePoolParamaters
  ): pulumi.Output<string> {
    const nameOfNodePoolResource = `${this.utils.getResourcesBaseName()}-${name}`;
    const nodePool = new NodePool(
      nameOfNodePoolResource,
      {
        name: `${this.utils.getResourcesBaseName()}-${name}`,
        clusterId: nodePoolParameters.clusterId,
        size: nodePoolParameters.size,
        nodeCount: nodePoolParameters.nodeCount,
        tags: nodePoolParameters.tags,
        taints: nodePoolParameters.taints,
      },
      {
        parent: this,
      }
    );
    return nodePool.id;
  }
}
