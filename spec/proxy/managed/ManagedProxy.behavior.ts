import { describeBehaviorOfProxy } from '../Proxy.behavior';
import { describeFilter } from '@solidstate/library';
import { ManagedProxy } from '@solidstate/types';

interface ManagedProxyBehaviorArgs {
  deploy: () => Promise<ManagedProxy>;
  implementationFunction: string;
  implementationFunctionArgs: string[];
}

export function describeBehaviorOfManagedProxy(
  {
    deploy,
    implementationFunction,
    implementationFunctionArgs,
  }: ManagedProxyBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::ManagedProxy', function () {
    describeBehaviorOfProxy(
      {
        deploy,
        implementationFunction,
        implementationFunctionArgs,
      },
      [],
    );
  });
}
