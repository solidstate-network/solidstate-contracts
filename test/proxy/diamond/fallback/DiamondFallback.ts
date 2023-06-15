import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { describeBehaviorOfDiamondFallback } from '@solidstate/spec';
import {
  DiamondFallbackMock,
  DiamondFallbackMock__factory,
  OwnableMock__factory,
} from '@solidstate/typechain-types';
import { ethers } from 'hardhat';

describe('DiamondFallback', function () {
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let instance: DiamondFallbackMock;

  before(async () => {
    [owner, nonOwner] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    const facetInstance = await new OwnableMock__factory(deployer).deploy(
      deployer.address,
    );

    instance = await new DiamondFallbackMock__factory(deployer).deploy([
      {
        facetAddress: facetInstance.address,
        action: 0,
        functionSelectors: [facetInstance.interface.getSighash('owner()')],
      },
    ]);
  });

  describeBehaviorOfDiamondFallback(async () => instance, {
    getOwner: async () => owner,
    getNonOwner: async () => nonOwner,
    facetFunction: 'owner()',
    facetFunctionArgs: [],
    fallbackAddress: ethers.constants.AddressZero,
  });
});
