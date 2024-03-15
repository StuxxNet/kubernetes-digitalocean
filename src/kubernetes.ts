import * as pulumi from '@pulumi/pulumi';

import { type StackConfiguration } from './config';
import { KubernetesControlPlane } from './resources/kubernetes-controlplane';
import { KubernetesNodePool } from './resources/kubernetes-nodepool';
import { type Utils } from './utils';

export class Kubernetes extends pulumi.ComponentResource {
  constructor(
    vpcId: pulumi.Output<string>,
    utils: Utils,
    stackConfiguration: StackConfiguration,
    opts: pulumi.ComponentResourceOptions
  ) {
    const nameOfKubernetesClusterComponentResource = `${utils.getResourcesBaseName()}-kubernetes-cluster`;
    super(
      'easy-k8s:kubernetes',
      nameOfKubernetesClusterComponentResource,
      {},
      opts
    );

    const kubernetesControlPlane = new KubernetesControlPlane(
      vpcId,
      utils,
      stackConfiguration,
      {
        parent: this,
      }
    );

    const ingressNodePool = new KubernetesNodePool(utils, {
      parent: this,
    });

    ingressNodePool.createKubernetesNodePool('ingress-nodepool', {
      clusterId: kubernetesControlPlane.getKubernetesControlPlaneId(),
      size: stackConfiguration.ingressNodePoolSize,
      nodeCount: stackConfiguration.ingressNodePoolCount,
      tags: utils.getDefaultTags(),
      taints: [
        {
          key: 'kubernetes.io/reserved-node',
          value: 'true',
          effect: 'NoSchedule',
        },
      ],
      labels: {
        "app": "ingress"
      }
    });
  }
}
