import { describeBehaviorOfERC1271Base } from '../base/ERC1271Base.behavior';
import { describeFilter } from '@solidstate/library';
import { IERC1271Stored } from '@solidstate/typechain-types';
import { ethers } from 'hardhat';

interface ERC1271OwnableBehaviorArgs {
  deploy: () => Promise<IERC1271Stored>;
  getValidParams: () => Promise<[Uint8Array, Uint8Array]>;
}

export function describeBehaviorOfERC1271Stored(
  { deploy, getValidParams }: ERC1271OwnableBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::ERC1271Stored', function () {
    describeBehaviorOfERC1271Base(
      {
        deploy,
        getValidParams,
        getInvalidParams: async () => [
          ethers.utils.randomBytes(32),
          ethers.utils.randomBytes(0),
        ],
      },
      skips,
    );
  });
}