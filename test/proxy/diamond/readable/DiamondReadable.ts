import { deployMockContract } from '@ethereum-waffle/mock-contract';
import { describeBehaviorOfDiamondReadable } from '@solidstate/spec';
import {
  DiamondReadableMock,
  DiamondReadableMock__factory,
  IDiamondWritableInternal,
} from '@solidstate/typechain-types';
import { ethers } from 'hardhat';

describe('DiamondReadable', function () {
  let facet;
  const facetCuts: IDiamondWritableInternal.FacetCutStruct[] = [];

  let instance: DiamondReadableMock;

  before(async function () {
    const functions = [];
    const functionSelectors = [];

    for (let i = 0; i < 24; i++) {
      const fn = `fn${i}()`;
      functions.push(fn);
      functionSelectors.push(
        ethers.utils.hexDataSlice(
          ethers.utils.solidityKeccak256(['string'], [fn]),
          0,
          4,
        ),
      );
    }

    const abi = functions.map((fn) => `function ${fn}`);

    const [owner] = await ethers.getSigners();
    facet = await deployMockContract(owner, abi);

    facetCuts.push({
      facetAddress: facet.address,
      action: 0,
      functionSelectors,
    });
  });

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    instance = await new DiamondReadableMock__factory(deployer).deploy(
      facetCuts,
    );
  });

  describeBehaviorOfDiamondReadable(async () => instance, {
    facetCuts,
  });
});
