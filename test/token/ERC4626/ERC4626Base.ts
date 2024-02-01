import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { describeBehaviorOfERC4626Base } from '@solidstate/spec';
import {
  ERC4626BaseMock,
  ERC4626BaseMock__factory,
  SolidStateERC20Mock,
  SolidStateERC20Mock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

const name = 'ERC20Metadata.name';
const symbol = 'ERC20Metadata.symbol';
const decimals = 18;

describe('ERC4626Base', () => {
  let deployer: SignerWithAddress;
  let depositor: SignerWithAddress;
  let instance: ERC4626BaseMock;
  let assetInstance: SolidStateERC20Mock;

  before(async () => {
    [deployer, depositor] = await ethers.getSigners();
  });

  beforeEach(async () => {
    assetInstance = await new SolidStateERC20Mock__factory(deployer).deploy(
      '',
      '',
      0,
      0,
    );

    instance = await new ERC4626BaseMock__factory(deployer).deploy(
      await assetInstance.getAddress(),
      name,
      symbol,
      decimals,
    );
  });

  describeBehaviorOfERC4626Base(async () => instance, {
    getAsset: async () => assetInstance,
    supply: 0n,
    mint: (recipient: string, amount: bigint) =>
      instance.__mint(recipient, amount),
    burn: (recipient: string, amount: bigint) =>
      instance.__burn(recipient, amount),
    mintAsset: (recipient: string, amount: bigint) =>
      assetInstance.__mint(recipient, amount),
    name,
    symbol,
    decimals,
  });

  describe('__internal', () => {
    describe('#_deposit(uint256,address)', () => {
      it('calls the _afterDeposit hook', async () => {
        const assetAmount = 10;

        await instance.__mint(deployer.address, assetAmount);
        await assetInstance.__mint(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        const shareAmount =
          await instance.previewDeposit.staticCall(assetAmount);

        expect(
          await instance
            .connect(depositor)
            .deposit(assetAmount, depositor.address),
        )
          .to.emit(instance, 'AfterDepositCheck')
          .withArgs(depositor.address, assetAmount, shareAmount);
      });
    });
  });
});
