import { describeBehaviorOfERC1271Stored } from '@solidstate/spec';
import {
  ERC1271StoredMock,
  ERC1271StoredMock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

const validParams: [Uint8Array, Uint8Array] = [
  ethers.randomBytes(32),
  ethers.randomBytes(0),
];

describe('ERC1271Stored', () => {
  let instance: ERC1271StoredMock;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();
    instance = await new ERC1271StoredMock__factory(deployer).deploy(
      validParams[0],
    );
  });

  describeBehaviorOfERC1271Stored(async () => instance as any, {
    getValidParams: async () => validParams,
  });

  describe('__internal', () => {
    describe('#_isValidSignature(bytes32,bytes)', () => {
      it('returns magic value if signature is stored', async () => {
        expect(
          await instance.__isValidSignature.staticCall(
            validParams[0],
            validParams[1],
          ),
        ).to.equal('0x1626ba7e');
      });

      it('returns null bytes if signature is not stored', async () => {
        expect(
          await instance.__isValidSignature.staticCall(
            ethers.randomBytes(32),
            ethers.randomBytes(0),
          ),
        ).to.equal('0x00000000');
      });
    });

    describe('#_setValidSignature(bytes32,bool)', () => {
      it('sets signature validity', async () => {
        let hash = ethers.randomBytes(32);
        let signature = ethers.randomBytes(0);

        expect(
          await instance.__isValidSignature.staticCall(hash, signature),
        ).to.equal('0x00000000');

        await instance.__setValidSignature(hash, true);

        expect(
          await instance.__isValidSignature.staticCall(hash, signature),
        ).to.equal('0x1626ba7e');

        await instance.__setValidSignature(hash, false);

        expect(
          await instance.__isValidSignature.staticCall(hash, signature),
        ).to.equal('0x00000000');
      });
    });
  });
});
