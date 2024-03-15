import { type StackConfiguration } from './config';

export class Utils {
  constructor(private stackConfiguration: StackConfiguration) {}

  public getResourcesBaseName() {
    return `${this.stackConfiguration.projectName}-${this.stackConfiguration.environment}`;
  }

  public getDefaultTags() {
    return ['pulumi', 'labs'];
  }
}
