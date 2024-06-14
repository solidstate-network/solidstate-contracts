import { describeBehaviorOfERC1271Base } from '../base/ERC1271Base.behavior';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { describeFilter } from '@solidstate/library';
import { IERC1271Ownable } from '@solidstate/typechain-types';
import { ethers } from 'hardhat';

export interface ERC1271OwnableBehaviorArgs {
  getOwner: () => Promise<SignerWithAddress>;
  getNonOwner: () => Promise<SignerWithAddress>;
}

export function describeBehaviorOfERC1271Ownable(
  deploy: () => Promise<IERC1271Ownable>,
  args: ERC1271OwnableBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::ERC1271Ownable', () => {
    let owner: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    beforeEach(async () => {
      owner = await args.getOwner();
      nonOwner = await args.getNonOwner();
    });

    // TODO: nonstandard usage
    describeBehaviorOfERC1271Base(
      deploy,
      {
        getValidParams: async () => {
          const hash = ethers.randomBytes(32);
          const signature = await owner.signMessage(ethers.getBytes(hash));
          return [hash, ethers.getBytes(signature)];
        },
        getInvalidParams: async () => {
          const hash = ethers.randomBytes(32);
          const signature = await nonOwner.signMessage(ethers.getBytes(hash));
          return [hash, ethers.getBytes(signature)];
        },
      },
      skips,
    );
  });
}
