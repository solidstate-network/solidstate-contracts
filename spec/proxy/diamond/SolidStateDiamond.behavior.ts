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
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { deployMockContract } from '@solidstate/library';
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

  describe('::SolidStateDiamond', () => {
    let owner: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    let instance: ISolidStateDiamond;

    before(async () => {
      owner = await args.getOwner();
      nonOwner = await args.getNonOwner();
    });

    beforeEach(async () => {
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

    describe('receive()', () => {
      it('accepts ether transfer', async () => {
        const [signer] = await ethers.getSigners();
        const value = 1;
        const to = await instance.getAddress();

        await expect(() =>
          signer.sendTransaction({ to, value }),
        ).to.changeEtherBalance(instance, value);
      });
    });

    describe('#diamondCut((address,enum,bytes4[])[],address,bytes)', () => {
      const selectors: string[] = [];
      const abi: string[] = [];
      let facet: any;

      before(async () => {
        for (let i = 0; i < 24; i++) {
          const fn = `fn${i}()`;
          abi.push(`function ${fn}`);
          selectors.push(
            ethers.dataSlice(
              ethers.solidityPackedKeccak256(['string'], [fn]),
              0,
              4,
            ),
          );
        }

        facet = await deployMockContract(owner, abi);
      });

      it('adds selectors one-by-one', async () => {
        const expectedSelectors = [];

        for (let selector of selectors) {
          await instance
            .connect(owner)
            .diamondCut(
              [{ target: facet.address, action: 0, selectors: [selector] }],
              ethers.ZeroAddress,
              '0x',
            );

          expectedSelectors.push(selector);

          // call reverts, but with mock-specific message
          await expect(
            owner.sendTransaction({
              to: await instance.getAddress(),
              data: selector,
            }),
          ).to.be.revertedWith('Mock on the method is not initialized');

          expect(
            Array.from(await instance.facets.staticCall()),
          ).to.have.deep.members([
            ...args.facetCuts.map((fc) => [fc.target, fc.selectors]),
            [facet.address, expectedSelectors],
          ]);

          expect(
            Array.from(
              await instance.facetFunctionSelectors.staticCall(facet.address),
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(await instance.facetAddress.staticCall(selector)).to.equal(
            facet.address,
          );
        }
      });

      it('removes selectors one-by-one in ascending order of addition', async () => {
        await instance
          .connect(owner)
          .diamondCut(
            [{ target: facet.address, action: 0, selectors }],
            ethers.ZeroAddress,
            '0x',
          );

        const expectedSelectors = [...selectors];

        for (let selector of selectors) {
          await instance.connect(owner).diamondCut(
            [
              {
                target: ethers.ZeroAddress,
                action: 2,
                selectors: [selector],
              },
            ],
            ethers.ZeroAddress,
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
              owner.sendTransaction({
                to: await instance.getAddress(),
                data: last,
              }),
            ).to.be.revertedWith('Mock on the method is not initialized');
          }

          await expect(
            owner.sendTransaction({
              to: await instance.getAddress(),
              data: selector,
            }),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );

          expect(
            Array.from(await instance.facets.staticCall()),
          ).to.have.deep.members(
            [
              ...args.facetCuts.map((fc) => [fc.target, fc.selectors]),
              [facet.address, expectedSelectors],
            ].filter((f) => f[1].length),
          );

          expect(
            Array.from(
              await instance.facetFunctionSelectors.staticCall(facet.address),
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(await instance.facetAddress.staticCall(selector)).to.equal(
            ethers.ZeroAddress,
          );
        }
      });

      it('removes selectors one-by-one in descending order of addition', async () => {
        await instance
          .connect(owner)
          .diamondCut(
            [{ target: facet.address, action: 0, selectors }],
            ethers.ZeroAddress,
            '0x',
          );

        const expectedSelectors = [...selectors];

        for (let selector of [...selectors].reverse()) {
          await instance.connect(owner).diamondCut(
            [
              {
                target: ethers.ZeroAddress,
                action: 2,
                selectors: [selector],
              },
            ],
            ethers.ZeroAddress,
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
              owner.sendTransaction({
                to: await instance.getAddress(),
                data: last,
              }),
            ).to.be.revertedWith('Mock on the method is not initialized');
          }

          await expect(
            owner.sendTransaction({
              to: await instance.getAddress(),
              data: selector,
            }),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );

          expect(
            Array.from(await instance.facets.staticCall()),
          ).to.have.deep.members(
            [
              ...args.facetCuts.map((fc) => [fc.target, fc.selectors]),
              [facet.address, expectedSelectors],
            ].filter((f) => f[1].length),
          );

          expect(
            Array.from(
              await instance.facetFunctionSelectors.staticCall(facet.address),
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(await instance.facetAddress.staticCall(selector)).to.equal(
            ethers.ZeroAddress,
          );
        }
      });

      it('removes selectors one-by-one in random order', async () => {
        await instance
          .connect(owner)
          .diamondCut(
            [{ target: facet.address, action: 0, selectors }],
            ethers.ZeroAddress,
            '0x',
          );

        const expectedSelectors = [...selectors];

        for (let selector of [...selectors].sort(() => 0.5 - Math.random())) {
          await instance.connect(owner).diamondCut(
            [
              {
                target: ethers.ZeroAddress,
                action: 2,
                selectors: [selector],
              },
            ],
            ethers.ZeroAddress,
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
              owner.sendTransaction({
                to: await instance.getAddress(),
                data: last,
              }),
            ).to.be.revertedWith('Mock on the method is not initialized');
          }

          await expect(
            owner.sendTransaction({
              to: await instance.getAddress(),
              data: selector,
            }),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );

          expect(
            Array.from(await instance.facets.staticCall()),
          ).to.have.deep.members(
            [
              ...args.facetCuts.map((fc) => [fc.target, fc.selectors]),
              [facet.address, expectedSelectors],
            ].filter((f) => f[1].length),
          );

          expect(
            Array.from(
              await instance.facetFunctionSelectors.staticCall(facet.address),
            ),
          ).to.have.deep.members(expectedSelectors);

          expect(await instance.facetAddress.staticCall(selector)).to.equal(
            ethers.ZeroAddress,
          );
        }
      });
    });
  });
}
