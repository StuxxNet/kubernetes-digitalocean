import * as pulumi from '@pulumi/pulumi';
import { type Provider } from '@pulumi/kubernetes';
import { type StackConfiguration } from './stack-configuration';
import { type Utils } from './utils';
import { type KubernetesNodePool } from './resources/kubernetes-nodepool';
import * as kubernetes from '@pulumi/kubernetes';

interface NodeTaints {
  key: string;
  value: string;
  effect: string;
}

export class KubernetesIngressNodePool extends pulumi.ComponentResource {
  constructor(
    private readonly kubernetesNodePool: KubernetesNodePool,
    private readonly provider: Provider,
    private readonly utils: Utils,
    private readonly stackConfiguration: StackConfiguration,
    opts: pulumi.ComponentResourceOptions
  ) {
    const nameOfKubernetesIngressNodePool = `${utils.getResourcesBaseName()}-kubernetes-ingress-nodepool`;
    super(
      'easy-k8s:kubernetes-ingress-node',
      nameOfKubernetesIngressNodePool,
      {},
      opts
    );
    this.createNodePool(this.stackConfiguration, this.utils);
    this.deployIngress(this.provider);
  }

  private createNodePool(stackConfiguration: StackConfiguration, utils: Utils) {
    const nameOfKubernetesIngressNodePool = 'kubernetes-ingress-nodepool';
    this.kubernetesNodePool.createKubernetesNodePool(
      nameOfKubernetesIngressNodePool,
      {
        size: stackConfiguration.ingressNodePoolSize,
        minNodes: stackConfiguration.ingressNodePoolMinCount,
        maxNodes: stackConfiguration.ingressNodePoolMaxCount,
        tags: utils.getDefaultTags(),
        taints: this.getNodeTaints(),
        labels: this.getNodeLabels(),
      }
    );
  }

  private getNodeTaints(): NodeTaints[] {
    return [
      {
        key: 'kubernetes.io/reserved-node',
        value: 'true',
        effect: 'NoSchedule',
      },
    ];
  }

  private getNodeLabels(): Record<string, string> {
    return {
      app: 'ingress',
    };
  }

  private deployIngress(provider: Provider) {
    const nameOfTheIngressRelease = `easy-k8s-ingress`;
    new kubernetes.helm.v3.Release(
      nameOfTheIngressRelease,
      {
        chart: 'ingress-nginx',
        version: '4.10.0',
        repositoryOpts: {
          repo: 'https://kubernetes.github.io/ingress-nginx',
        },
        createNamespace: true,
        namespace: 'ingress-nginx',
        values: this.getIngressHelmValues(),
      },
      {
        provider: provider,
        parent: this,
      }
    );
  }

  private getIngressHelmValues() {
    return {
      controller: {
        tolerations: [
          {
            key: 'kubernetes.io/reserved-node',
            operator: 'Equal',
            value: 'true',
            effect: 'NoSchedule',
          },
        ],
        service: {
          annotations: {
            'external-dns.alpha.kubernetes.io/hostname': '*.ramonborges.site',
            'external-dns.alpha.kubernetes.io/ttl': '120',
          },
        },
        nodeSelector: {
          app: 'ingress',
        },
        replicaCount: 2,
      },
    };
  }
}
