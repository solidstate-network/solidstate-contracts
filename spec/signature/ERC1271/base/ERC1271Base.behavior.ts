import { describeFilter } from '@solidstate/library';
import { IERC1271Base } from '@solidstate/typechain-types';
import { expect } from 'chai';

export interface ERC1271BaseBehaviorArgs {
  getValidParams: () => Promise<[Uint8Array, Uint8Array]>;
  getInvalidParams: () => Promise<[Uint8Array, Uint8Array]>;
}

export function describeBehaviorOfERC1271Base(
  deploy: () => Promise<IERC1271Base>,
  args: ERC1271BaseBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::ERC1271Base', () => {
    let instance: IERC1271Base;

    beforeEach(async () => {
      instance = await deploy();
    });

    describe('#isValidSignature(bytes32,bytes)', () => {
      it('returns 0x1626ba7e for valid signature', async () => {
        expect(
          await instance.isValidSignature.staticCall(
            ...(await args.getValidParams()),
          ),
        ).to.equal('0x1626ba7e');
      });

      it('returns 0x00000000 for invalid signature', async () => {
        expect(
          await instance.isValidSignature.staticCall(
            ...(await args.getInvalidParams()),
          ),
        ).to.equal('0x00000000');
      });
    });
  });
}
