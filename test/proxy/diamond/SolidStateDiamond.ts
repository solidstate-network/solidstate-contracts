import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { describeBehaviorOfSolidStateDiamond } from '@solidstate/spec';
import {
  SolidStateDiamond,
  SolidStateDiamondMock__factory,
  IDiamondWritableInternal,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SolidStateDiamond', function () {
  let owner: SignerWithAddress;
  let nomineeOwner: SignerWithAddress;
  let nonOwner: SignerWithAddress;

  let instance: SolidStateDiamond;

  let facetCuts: IDiamondWritableInternal.FacetCutStruct[] = [];

  before(async function () {
    [owner, nomineeOwner, nonOwner] = await ethers.getSigners();
  });

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    instance = await new SolidStateDiamondMock__factory(deployer).deploy();

    const facets = await instance.callStatic['facets()']();

    expect(facets).to.have.lengthOf(1);

    facetCuts[0] = {
      facetAddress: instance.address,
      action: 0,
      functionSelectors: facets[0].selectors,
    };
  });

  describeBehaviorOfSolidStateDiamond(
    async () => instance,
    {
      getOwner: async () => owner,
      getNomineeOwner: async () => nomineeOwner,
      getNonOwner: async () => nonOwner,
      facetFunction: '',
      facetFunctionArgs: [],
      facetCuts,
      fallbackAddress: ethers.constants.AddressZero,
    },
    ['fallback()'],
  );
});
