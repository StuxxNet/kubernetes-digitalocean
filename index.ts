import { StackConfiguration } from './src/stack-configuration';
import { Utils } from './src/utils';
import { Vpc } from './src/vpc';
import { KubernetesControlPlane } from './src/resources/kubernetes-controlplane';
import { KubernetesNodePool } from './src/resources/kubernetes-nodepool';
import { KubernetesIngressNodePool } from './src/ingress-nodegroup';
import { GoDaddyConfiguration } from './src/godaddy-configuration';
import { ExternalDNS } from './src/external-dns';

const stackConfiguration = StackConfiguration.load();
const goDaddyConfiguration = GoDaddyConfiguration.load();
const utils = new Utils(stackConfiguration);
const vpc = new Vpc(utils, stackConfiguration, {});
const kubernetesControlPlane = new KubernetesControlPlane(
  vpc.getVpcId(),
  utils,
  stackConfiguration,
  {}
);
const kubernetesProvider = kubernetesControlPlane.getKubernetesProvider(utils);
const kubernetesNodePool = new KubernetesNodePool(
  kubernetesControlPlane.getKubernetesControlPlaneId(),
  utils,
  {}
);
new KubernetesIngressNodePool(
  kubernetesNodePool,
  kubernetesProvider,
  utils,
  stackConfiguration,
  {}
);
new ExternalDNS(utils, kubernetesProvider, goDaddyConfiguration, {});