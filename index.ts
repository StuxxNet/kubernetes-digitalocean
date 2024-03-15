import { StackConfiguration } from './src/config';
import { Kubernetes } from './src/kubernetes';
import { Utils } from './src/utils';
import { Vpc } from './src/vpc';

const stackConfiguration = StackConfiguration.load();
const utils = new Utils(stackConfiguration);
const vpc = new Vpc(utils, stackConfiguration, {});
new Kubernetes(vpc.getVpcId(), utils, stackConfiguration, {});
