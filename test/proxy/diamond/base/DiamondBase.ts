import { describeBehaviorOfDiamondBase } from '@solidstate/spec';
import {
  DiamondBaseMock,
  DiamondBaseMock__factory,
  OwnableMock__factory,
} from '@solidstate/typechain-types';
import { ethers } from 'hardhat';

describe('DiamondBase', function () {
  let instance: DiamondBaseMock;

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    const facetInstance = await new OwnableMock__factory(deployer).deploy(
      deployer.address,
    );

    instance = await new DiamondBaseMock__factory(deployer).deploy([
      {
        facetAddress: facetInstance.address,
        action: 0,
        functionSelectors: [facetInstance.interface.getSighash('owner()')],
      },
    ]);
  });

  describeBehaviorOfDiamondBase(async () => instance, {
    facetFunction: 'owner()',
    facetFunctionArgs: [],
  });
});
