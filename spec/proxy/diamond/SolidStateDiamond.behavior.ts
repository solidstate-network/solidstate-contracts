import {
  describeBehaviorOfSafeOwnable,
  SafeOwnableBehaviorArgs,
} from '../../access';
import { describeBehaviorOfERC165Base } from '../../introspection';
import {
  describeBehaviorOfDiamondBase,
  DiamondBaseBehaviorArgs,
} from './base/DiamondBase.behavior';
import {
  describeBehaviorOfDiamondFallback,
  DiamondFallbackBehaviorArgs,
} from './fallback/DiamondFallback.behavior';
import {
  describeBehaviorOfDiamondReadable,
  DiamondReadableBehaviorArgs,
} from './readable/DiamondReadable.behavior';
import {
  describeBehaviorOfDiamondWritable,
  DiamondWritableBehaviorArgs,
} from './writable/DiamondWritable.behavior';
import {
  deployMockContract,
  MockContract,
} from '@ethereum-waffle/mock-contract';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { describeFilter } from '@solidstate/library';
import { ISolidStateDiamond } from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

export interface SolidStateDiamondBehaviorArgs
  extends DiamondBaseBehaviorArgs,
    DiamondFallbackBehaviorArgs,
    DiamondReadableBehaviorArgs,
    DiamondWritableBehaviorArgs,
    SafeOwnableBehaviorArgs {}

export function describeBehaviorOfSolidStateDiamond(
  deploy: () => Promise<ISolidStateDiamond>,
  args: SolidStateDiamondBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::SolidStateDiamond', function () {
    let owner: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    let instance: ISolidStateDiamond;

    before(async function () {
      owner = await args.getOwner();
      nonOwner = await args.getNonOwner();
    });

    beforeEach(async function () {
      instance = await deploy();
    });

    describeBehaviorOfDiamondBase(deploy, args, skips);

    describeBehaviorOfDiamondFallback(deploy, args, [
      '::DiamondBase',
      ...(skips ?? []),
    ]);

    describeBehaviorOfDiamondReadable(deploy, args, skips);

    describeBehaviorOfDiamondWritable(deploy, args, skips);

    // TODO: nonstandard usage
    describeBehaviorOfERC165Base(
      deploy as any,
      {
        interfaceIds: ['0x7f5828d0'],
      },
      skips,
    );

    describeBehaviorOfSafeOwnable(deploy, args, skips);

    describe('receive()', function () {
      it('accepts ether transfer', async function () {
        let [signer] = await ethers.getSigners();
        let value = ethers.constants.One;

        await expect(() =>
          signer.sendTransaction({ to: instance.address, value }),
        ).to.changeEtherBalance(instance, value);
      });
    });

    describe('#diamondCut((address,enum,bytes4[])[],address,bytes)', function () {
      const functionSelectors: string[] = [];
      const abi: string[] = [];
      let facet: MockContract;

      before(async function () {
        for (let i = 0; i < 24; i++) {
          const fn = `fn${i}()`;
          abi.push(`function ${fn}`);
          functionSelectors.push(
            ethers.utils.hexDataSlice(
              ethers.utils.solidityKeccak256(['string'], [fn]),
              0,
              4,
            ),
          );
        }

        facet = await deployMockContract(owner, abi);
      });

      it('adds selectors one-by-one', async function () {
        const expectedSelectors = [];

        for (let selector of functionSelectors) {
          await instance.connect(owner).diamondCut(
            [
              {
                facetAddress: facet.address,
                action: 0,
                functionSelectors: [selector],
              },
            ],
            ethers.constants.AddressZero,
            '0x',
          );

          expectedSelectors.push(selector);

          // call reverts, but with mock-specific message
          await expect(
            owner.sendTransaction({ to: instance.address, data: selector }),
          ).to.be.revertedWith('Mock on the method is not initialized');

          expect(await instance.callStatic['facets()']()).to.have.deep.members([
            ...args.facetCuts.map((fc) => [
              fc.facetAddress,
              fc.functionSelectors,
            ]),
            [facet.address, expectedSelectors],
          ]);

          expect(
            await instance.callStatic['facetFunctionSelectors(address)'](
              facet.address,
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(
            await instance.callStatic['facetAddress(bytes4)'](selector),
          ).to.equal(facet.address);
        }
      });

      it('removes selectors one-by-one in ascending order of addition', async function () {
        await instance
          .connect(owner)
          .diamondCut(
            [{ facetAddress: facet.address, action: 0, functionSelectors }],
            ethers.constants.AddressZero,
            '0x',
          );

        const expectedSelectors = [...functionSelectors];

        for (let selector of functionSelectors) {
          await instance.connect(owner).diamondCut(
            [
              {
                facetAddress: ethers.constants.AddressZero,
                action: 2,
                functionSelectors: [selector],
              },
            ],
            ethers.constants.AddressZero,
            '0x',
          );

          const last = expectedSelectors.pop();

          if (last && last !== selector) {
            expectedSelectors.splice(
              expectedSelectors.indexOf(selector),
              1,
              last,
            );

            // call reverts, but with mock-specific message
            await expect(
              owner.sendTransaction({ to: instance.address, data: last }),
            ).to.be.revertedWith('Mock on the method is not initialized');
          }

          await expect(
            owner.sendTransaction({ to: instance.address, data: selector }),
          ).to.be.revertedWithCustomError(
            instance,
            'Proxy__ImplementationIsNotContract',
          );

          expect(await instance.callStatic['facets()']()).to.have.deep.members(
            [
              ...args.facetCuts.map<[any, any[]]>((fc) => [
                fc.facetAddress,
                fc.functionSelectors,
              ]),
              [facet.address, expectedSelectors],
            ].filter((f) => f[1].length),
          );

          expect(
            await instance.callStatic['facetFunctionSelectors(address)'](
              facet.address,
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(
            await instance.callStatic['facetAddress(bytes4)'](selector),
          ).to.equal(ethers.constants.AddressZero);
        }
      });

      it('removes selectors one-by-one in descending order of addition', async function () {
        await instance
          .connect(owner)
          .diamondCut(
            [{ facetAddress: facet.address, action: 0, functionSelectors }],
            ethers.constants.AddressZero,
            '0x',
          );

        const expectedSelectors = [...functionSelectors];

        for (let selector of [...functionSelectors].reverse()) {
          await instance.connect(owner).diamondCut(
            [
              {
                facetAddress: ethers.constants.AddressZero,
                action: 2,
                functionSelectors: [selector],
              },
            ],
            ethers.constants.AddressZero,
            '0x',
          );

          const last = expectedSelectors.pop();

          if (last && last !== selector) {
            expectedSelectors.splice(
              expectedSelectors.indexOf(selector),
              1,
              last,
            );

            // call reverts, but with mock-specific message
            await expect(
              owner.sendTransaction({ to: instance.address, data: last }),
            ).to.be.revertedWith('Mock on the method is not initialized');
          }

          await expect(
            owner.sendTransaction({ to: instance.address, data: selector }),
          ).to.be.revertedWithCustomError(
            instance,
            'Proxy__ImplementationIsNotContract',
          );

          expect(await instance.callStatic['facets()']()).to.have.deep.members(
            [
              ...args.facetCuts.map<[any, any[]]>((fc) => [
                fc.facetAddress,
                fc.functionSelectors,
              ]),
              [facet.address, expectedSelectors],
            ].filter((f) => f[1].length),
          );

          expect(
            await instance.callStatic['facetFunctionSelectors(address)'](
              facet.address,
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(
            await instance.callStatic['facetAddress(bytes4)'](selector),
          ).to.equal(ethers.constants.AddressZero);
        }
      });

      it('removes selectors one-by-one in random order', async function () {
        await instance
          .connect(owner)
          .diamondCut(
            [{ facetAddress: facet.address, action: 0, functionSelectors }],
            ethers.constants.AddressZero,
            '0x',
          );

        const expectedSelectors = [...functionSelectors];

        for (let selector of [...functionSelectors].sort(
          () => 0.5 - Math.random(),
        )) {
          await instance.connect(owner).diamondCut(
            [
              {
                facetAddress: ethers.constants.AddressZero,
                action: 2,
                functionSelectors: [selector],
              },
            ],
            ethers.constants.AddressZero,
            '0x',
          );

          const last = expectedSelectors.pop();

          if (last && last !== selector) {
            expectedSelectors.splice(
              expectedSelectors.indexOf(selector),
              1,
              last,
            );

            // call reverts, but with mock-specific message
            await expect(
              owner.sendTransaction({ to: instance.address, data: last }),
            ).to.be.revertedWith('Mock on the method is not initialized');
          }

          await expect(
            owner.sendTransaction({ to: instance.address, data: selector }),
          ).to.be.revertedWithCustomError(
            instance,
            'Proxy__ImplementationIsNotContract',
          );

          expect(await instance.callStatic['facets()']()).to.have.deep.members(
            [
              ...args.facetCuts.map<[any, any[]]>((fc) => [
                fc.facetAddress,
                fc.functionSelectors,
              ]),
              [facet.address, expectedSelectors],
            ].filter((f) => f[1].length),
          );

          expect(
            await instance.callStatic['facetFunctionSelectors(address)'](
              facet.address,
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(
            await instance.callStatic['facetAddress(bytes4)'](selector),
          ).to.equal(ethers.constants.AddressZero);
        }
      });
    });
  });
}
