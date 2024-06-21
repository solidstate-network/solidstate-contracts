import { describeBehaviorOfProxy, ProxyBehaviorArgs } from '../Proxy.behavior';
import { describeFilter } from '@solidstate/library';
import { IBeaconProxy } from '@solidstate/typechain-types';

export interface BeaconProxyBehaviorArgs extends ProxyBehaviorArgs {}

export function describeBehaviorOfBeaconProxy(
  deploy: () => Promise<IBeaconProxy>,
  args: BeaconProxyBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::BeaconProxy', () => {
    describeBehaviorOfProxy(deploy, args, skips);
  });
}
