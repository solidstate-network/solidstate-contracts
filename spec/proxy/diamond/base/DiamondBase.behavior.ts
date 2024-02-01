import { describeFilter } from '@solidstate/library';
import { IDiamondBase } from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

export interface DiamondBaseBehaviorArgs {
  facetFunction: string;
  facetFunctionArgs: string[];
}

export function describeBehaviorOfDiamondBase(
  deploy: () => Promise<IDiamondBase>,
  { facetFunction, facetFunctionArgs }: DiamondBaseBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::DiamondBase', () => {
    let instance: IDiamondBase;

    beforeEach(async () => {
      instance = await deploy();
    });

    describe('fallback()', () => {
      it('forwards data with matching selector call to facet', async () => {
        expect(instance.interface.hasFunction(facetFunction)).to.be.false;

        let contract = new ethers.Contract(
          await instance.getAddress(),
          [`function ${facetFunction}`],
          ethers.provider,
        );

        await expect(contract[facetFunction].staticCall(...facetFunctionArgs))
          .not.to.be.reverted;
      });

      it('forwards data without matching selector to fallback contract');

      describe('reverts if', () => {
        it('no selector matches data', async () => {
          let contract = new ethers.Contract(
            await instance.getAddress(),
            ['function __function()'],
            ethers.provider,
          );

          await expect(
            contract.__function.staticCall(),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );
        });
      });
    });
  });
}
