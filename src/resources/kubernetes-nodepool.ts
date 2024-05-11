import { KubernetesNodePool as NodePool } from '@pulumi/digitalocean/kubernetesNodePool';
import * as pulumi from '@pulumi/pulumi';

import { type Utils } from '../utils';

export interface NodePoolParamaters {
  size: string;
  minNodes: number;
  maxNodes: number;
  taints?: TaintsParameters[];
  labels?: { [key: string]: string };
  tags: string[];
}

export interface TaintsParameters {
  key: string;
  value: string;
  effect: string;
}

export class KubernetesNodePool extends pulumi.ComponentResource {
  private readonly utils: Utils;
  private readonly clusterId: pulumi.Output<string>;

  constructor(
    clusterId: pulumi.Output<string>,
    utils: Utils,
    opts: pulumi.ComponentResourceOptions
  ) {
    const nameOfNodePoolComponent = `${utils.getResourcesBaseName()}-component-resource-nodepool`;
    super('easy-k8s:nodepool', nameOfNodePoolComponent, {}, opts);
    this.clusterId = clusterId;
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
        clusterId: this.clusterId,
        size: nodePoolParameters.size,
        autoScale: true,
        minNodes: nodePoolParameters.minNodes,
        maxNodes: nodePoolParameters.maxNodes,
        tags: nodePoolParameters.tags,
        taints: nodePoolParameters.taints,
        labels: nodePoolParameters.labels,
      },
      {
        parent: this,
      }
    );
    return nodePool.id;
  }
}
