import { describeBehaviorOfERC20Base, ERC20BaseBehaviorArgs } from '../ERC20';
import {
  describeBehaviorOfERC20Metadata,
  ERC20MetadataBehaviorArgs,
} from '../ERC20';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { describeFilter } from '@solidstate/library';
import { IERC20, IERC4626Base } from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ContractTransaction } from 'ethers';
import { ethers } from 'hardhat';

export interface ERC4626BaseBehaviorArgs
  extends ERC20BaseBehaviorArgs,
    ERC20MetadataBehaviorArgs {
  getAsset: () => Promise<IERC20>;
  mintAsset: (address: string, amount: bigint) => Promise<ContractTransaction>;
}

export function describeBehaviorOfERC4626Base(
  deploy: () => Promise<IERC4626Base>,
  args: ERC4626BaseBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::ERC4626Base', () => {
    let caller: SignerWithAddress;
    let depositor: SignerWithAddress;
    let recipient: SignerWithAddress;
    let assetInstance: IERC20;
    let instance: IERC4626Base;

    before(async () => {
      [caller, depositor, recipient] = await ethers.getSigners();
    });

    beforeEach(async () => {
      assetInstance = await args.getAsset();
      instance = await deploy();
    });

    describeBehaviorOfERC20Base(deploy, args, skips);

    describeBehaviorOfERC20Metadata(deploy, args, skips);

    describe('#asset()', () => {
      it('returns the address of the base asset', async () => {
        expect(await instance.asset.staticCall()).to.eq(
          await assetInstance.getAddress(),
        );
      });
    });

    describe('#convertToShares(uint256)', () => {
      it('returns input amount if share supply is zero', async () => {
        expect(await instance.convertToShares.staticCall(2)).to.eq(2);
      });

      it('returns the correct amount of shares if totalSupply is non-zero', async () => {
        await args.mint(await instance.getAddress(), 10n);

        const supply = await instance.totalSupply.staticCall();
        const assets = await instance.totalAssets.staticCall();

        const assetAmount = 3n;

        // result is rounded down

        expect(await instance.convertToShares.staticCall(assetAmount)).to.eq(
          (assetAmount * supply) / assets,
        );
      });
    });

    describe('#convertToAssets(uint256)', () => {
      it('returns input amount if share supply is zero', async () => {
        expect(await instance.convertToAssets.staticCall(2)).to.eq(2);
      });

      it('returns the correct amount of assets if totalSupply is non-zero', async () => {
        await args.mint(await instance.getAddress(), 10n);

        const supply = await instance.totalSupply.staticCall();
        const assets = await instance.totalAssets.staticCall();

        const shareAmount = 3n;

        // result is rounded down

        expect(await instance.convertToAssets.staticCall(shareAmount)).to.eq(
          (shareAmount * assets) / supply,
        );
      });
    });

    describe('#maxDeposit(address)', () => {
      it('returns maximum uint256', async () => {
        expect(await instance.maxDeposit.staticCall(depositor.address)).to.eq(
          ethers.MaxUint256,
        );
      });
    });

    describe('#maxMint(address)', () => {
      it('returns maximum uint256', async () => {
        expect(await instance.maxMint.staticCall(depositor.address)).to.eq(
          ethers.MaxUint256,
        );
      });
    });

    describe('#maxWithdraw(address)', () => {
      it('returns asset value of share balance of given account', async () => {
        await args.mint(depositor.address, 2n);
        const balance = await instance.balanceOf.staticCall(depositor.address);

        expect(await instance.maxWithdraw.staticCall(depositor.address)).to.eq(
          await instance.convertToAssets.staticCall(balance),
        );
      });
    });

    describe('#maxRedeem(address)', () => {
      it('returns share balance of given account', async () => {
        await args.mint(depositor.address, 2n);
        const balance = await instance.balanceOf.staticCall(depositor.address);

        expect(await instance.maxRedeem.staticCall(depositor.address)).to.eq(
          balance,
        );
      });
    });

    describe('#previewDeposit(uint256)', () => {
      it('returns the deposit input amount converted to shares', async () => {
        const assetAmount = ethers.parseUnits('1', 18);

        // result is rounded down

        expect(
          await instance
            .connect(depositor)
            .previewDeposit.staticCall(assetAmount),
        ).to.eq(await instance.convertToShares.staticCall(assetAmount));
      });
    });

    describe('#previewMint(uint256)', () => {
      it('todo: supply is 0');

      it('returns the mint input amount converted to assets', async () => {
        await args.mint(await instance.getAddress(), 10n);

        const supply = await instance.totalSupply.staticCall();
        const assets = await instance.totalAssets.staticCall();

        const shareAmount = 3n;

        const err = (shareAmount * assets) % supply === 0n ? 0n : 1n;

        // result is rounded up

        expect(
          await instance.connect(depositor).previewMint.staticCall(shareAmount),
        ).to.eq((await instance.convertToAssets.staticCall(shareAmount)) + err);
      });
    });

    describe('#previewWithdraw(uint256)', () => {
      it('todo: supply is 0');

      it('returns the withdraw input amount converted to shares', async () => {
        await args.mint(await instance.getAddress(), 10n);

        const supply = await instance.totalSupply.staticCall();
        const assets = await instance.totalAssets.staticCall();

        const assetAmount = 3n;

        const err = (assetAmount * supply) % assets === 0n ? 0n : 1n;

        // result is rounded up

        expect(
          await instance
            .connect(depositor)
            .previewWithdraw.staticCall(assetAmount),
        ).to.eq((await instance.convertToShares.staticCall(assetAmount)) + err);
      });
    });

    describe('#previewRedeem(uint256)', () => {
      it('returns the redeem input amount converted to assets', async () => {
        const shareAmount = ethers.parseUnits('1', 18);

        // result is rounded down

        expect(
          await instance
            .connect(depositor)
            .previewRedeem.staticCall(shareAmount),
        ).to.eq(await instance.convertToAssets.staticCall(shareAmount));
      });
    });

    describe('#deposit(uint256,address)', () => {
      it('transfers assets from caller', async () => {
        const assetAmount = 2n;

        await args.mint(caller.address, assetAmount);
        await args.mintAsset(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        await expect(() =>
          instance.connect(depositor).deposit(assetAmount, depositor.address),
        ).to.changeTokenBalances(
          assetInstance,
          [depositor, instance],
          [-assetAmount, assetAmount],
        );
      });

      it('mints shares for receiver', async () => {
        const assetAmount = 2n;

        await args.mint(caller.address, assetAmount);
        await args.mintAsset(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        const shareAmount = await instance
          .connect(depositor)
          .previewDeposit.staticCall(assetAmount);

        const oldBalance = await instance.balanceOf.staticCall(
          depositor.address,
        );

        await instance
          .connect(depositor)
          .deposit(assetAmount, depositor.address);

        const newBalance = await instance.balanceOf.staticCall(
          depositor.address,
        );

        const deltaBalance = newBalance - oldBalance;

        expect(deltaBalance).to.be.closeTo(shareAmount, 1);
        expect(deltaBalance).to.be.gte(shareAmount);
      });

      it('emits Deposit event', async () => {
        const assetAmount = 2n;

        await args.mint(caller.address, assetAmount);
        await args.mintAsset(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        const shareAmount = await instance
          .connect(depositor)
          .previewDeposit.staticCall(assetAmount);

        await expect(
          instance.connect(depositor).deposit(assetAmount, depositor.address),
        )
          .to.emit(instance, 'Deposit')
          .withArgs(
            depositor.address,
            depositor.address,
            assetAmount,
            shareAmount,
          );
      });

      describe('reverts if', () => {
        it.skip('deposit amount is too large', async () => {
          await expect(
            instance.deposit(ethers.MaxUint256, depositor.address),
          ).to.be.revertedWith('ERC4626: maximum amount exceeded');
        });
      });
    });

    describe('#mint(uint256,address)', () => {
      it('transfers assets from caller', async () => {
        const shareAmount = 10n;
        const assetAmount = await instance
          .connect(depositor)
          .previewMint.staticCall(shareAmount);

        await args.mintAsset(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        const oldCallerBalance = await assetInstance.balanceOf.staticCall(
          depositor.address,
        );
        const oldInstanceBalance = await assetInstance.balanceOf.staticCall(
          await instance.getAddress(),
        );

        await instance.connect(depositor).mint(shareAmount, depositor.address);

        const newCallerBalance = await assetInstance.balanceOf.staticCall(
          depositor.address,
        );
        const newInstanceBalance = await assetInstance.balanceOf.staticCall(
          await instance.getAddress(),
        );

        const deltaCallerBalance = oldCallerBalance - newCallerBalance;
        const deltaInstanceBalance = newInstanceBalance - oldInstanceBalance;

        expect(deltaCallerBalance).to.be.closeTo(assetAmount, 1);
        expect(deltaInstanceBalance).to.be.closeTo(assetAmount, 1);
        expect(deltaCallerBalance).to.be.lte(assetAmount);
        expect(deltaInstanceBalance).to.be.lte(assetAmount);
      });

      it('mints shares for receiver', async () => {
        const shareAmount = 10n;
        const assetAmount = await instance
          .connect(depositor)
          .previewMint.staticCall(shareAmount);

        await args.mintAsset(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        await expect(() =>
          instance.connect(depositor).mint(shareAmount, depositor.address),
        ).to.changeTokenBalance(instance, depositor, shareAmount);
      });

      it('emits Deposit event', async () => {
        const shareAmount = 10n;
        const assetAmount = await instance
          .connect(depositor)
          .previewMint.staticCall(shareAmount);

        await args.mintAsset(depositor.address, assetAmount);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmount);

        await expect(
          instance.connect(depositor).mint(shareAmount, depositor.address),
        )
          .to.emit(instance, 'Deposit')
          .withArgs(
            depositor.address,
            depositor.address,
            assetAmount,
            shareAmount,
          );
      });

      describe('reverts if', () => {
        it.skip('mint amount is too large', async () => {
          await expect(
            instance.mint(ethers.MaxUint256, depositor.address),
          ).to.be.revertedWith('ERC4626: maximum amount exceeded');
        });
      });
    });

    describe('#withdraw(uint256,address,address)', () => {
      it('transfers assets to receiver', async () => {
        const assetAmountIn = 10n;

        await args.mintAsset(depositor.address, assetAmountIn);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmountIn);
        await instance
          .connect(depositor)
          .deposit(assetAmountIn, depositor.address);

        const assetAmountOut = await instance.convertToAssets.staticCall(
          await instance.balanceOf.staticCall(depositor.address),
        );

        const shareAmount = await instance
          .connect(depositor)
          .previewWithdraw.staticCall(assetAmountOut);

        await expect(() =>
          instance
            .connect(depositor)
            .withdraw(assetAmountOut, recipient.address, depositor.address),
        ).to.changeTokenBalances(
          assetInstance,
          [recipient, instance],
          [assetAmountOut, -assetAmountOut],
        );
      });

      it('burns shares held by depositor', async () => {
        const assetAmountIn = 10n;

        await args.mintAsset(depositor.address, assetAmountIn);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmountIn);
        await instance
          .connect(depositor)
          .deposit(assetAmountIn, depositor.address);

        const assetAmountOut = await instance.convertToAssets.staticCall(
          await instance.balanceOf.staticCall(depositor.address),
        );

        const shareAmount = await instance
          .connect(depositor)
          .previewWithdraw.staticCall(assetAmountOut);

        const oldBalance = await instance.balanceOf.staticCall(
          depositor.address,
        );

        await instance
          .connect(depositor)
          .withdraw(assetAmountOut, recipient.address, depositor.address);

        const newBalance = await instance.balanceOf.staticCall(
          depositor.address,
        );

        const deltaBalance = oldBalance - newBalance;

        expect(deltaBalance).to.be.closeTo(shareAmount, 1);
        expect(deltaBalance).to.be.lte(shareAmount);
      });

      it('emits Withdraw event', async () => {
        const assetAmountIn = 10n;

        await args.mintAsset(depositor.address, assetAmountIn);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmountIn);
        await instance
          .connect(depositor)
          .deposit(assetAmountIn, depositor.address);
        await instance
          .connect(depositor)
          .approve(caller.address, ethers.MaxUint256);

        const assetAmountOut = await instance.convertToAssets.staticCall(
          await instance.balanceOf.staticCall(depositor.address),
        );

        const shareAmount = await instance
          .connect(depositor)
          .previewWithdraw.staticCall(assetAmountOut);

        await expect(
          instance
            .connect(caller)
            .withdraw(assetAmountOut, recipient.address, depositor.address),
        )
          .to.emit(instance, 'Withdraw')
          .withArgs(
            caller.address,
            recipient.address,
            depositor.address,
            assetAmountOut,
            shareAmount,
          );
      });

      describe('reverts if', () => {
        it('withdraw amount is too large', async () => {
          const assetAmount = 10n;
          const shareAmount =
            await instance.convertToShares.staticCall(assetAmount);

          await args.mint(depositor.address, shareAmount);

          const max = await instance.maxWithdraw.staticCall(depositor.address);

          await expect(
            instance.withdraw(max + 1n, recipient.address, depositor.address),
          ).to.be.revertedWithCustomError(
            instance,
            'ERC4626Base__MaximumAmountExceeded',
          );
        });

        it('share amount exceeds allowance', async () => {
          const assetAmountIn = 10n;

          await args.mintAsset(depositor.address, assetAmountIn);
          await assetInstance
            .connect(depositor)
            .approve(await instance.getAddress(), assetAmountIn);
          await instance
            .connect(depositor)
            .deposit(assetAmountIn, depositor.address);

          const assetAmountOut = await instance.convertToAssets.staticCall(
            await instance.balanceOf.staticCall(depositor.address),
          );

          await expect(
            instance
              .connect(caller)
              .withdraw(assetAmountOut, recipient.address, depositor.address),
          ).to.be.revertedWithCustomError(
            instance,
            'ERC4626Base__AllowanceExceeded',
          );
        });
      });
    });

    describe('#redeem(uint256,address,address)', () => {
      it('transfers assets to receiver', async () => {
        const assetAmountIn = 10n;

        await args.mintAsset(depositor.address, assetAmountIn);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmountIn);
        await instance
          .connect(depositor)
          .deposit(assetAmountIn, depositor.address);

        const shareAmount = await instance.balanceOf.staticCall(
          depositor.address,
        );

        const assetAmountOut = await instance
          .connect(depositor)
          .previewRedeem.staticCall(shareAmount);

        const oldInstanceBalance = await assetInstance.balanceOf.staticCall(
          await instance.getAddress(),
        );
        const oldReceiverBalance = await assetInstance.balanceOf.staticCall(
          recipient.address,
        );

        await instance
          .connect(depositor)
          .redeem(shareAmount, recipient.address, depositor.address);

        const newInstanceBalance = await assetInstance.balanceOf.staticCall(
          await instance.getAddress(),
        );
        const newReceiverBalance = await assetInstance.balanceOf.staticCall(
          recipient.address,
        );

        const deltaInstanceBalance = oldInstanceBalance - newInstanceBalance;
        const deltaReceiverBalance = newReceiverBalance - oldReceiverBalance;

        expect(deltaInstanceBalance).to.be.closeTo(assetAmountOut, 1);
        expect(deltaReceiverBalance).to.be.closeTo(assetAmountOut, 1);
        expect(deltaInstanceBalance).to.be.gte(assetAmountOut);
        expect(deltaReceiverBalance).to.be.gte(assetAmountOut);
      });

      it('burns shares held by depositor', async () => {
        const assetAmountIn = 10n;

        await args.mintAsset(depositor.address, assetAmountIn);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmountIn);
        await instance
          .connect(depositor)
          .deposit(assetAmountIn, depositor.address);

        const shareAmount = await instance.balanceOf.staticCall(
          depositor.address,
        );

        await expect(() =>
          instance
            .connect(depositor)
            .redeem(shareAmount, recipient.address, depositor.address),
        ).to.changeTokenBalance(instance, depositor, -shareAmount);
      });

      it('emits Withdraw event', async () => {
        const assetAmountIn = 10n;

        await args.mintAsset(depositor.address, assetAmountIn);
        await assetInstance
          .connect(depositor)
          .approve(await instance.getAddress(), assetAmountIn);
        await instance
          .connect(depositor)
          .deposit(assetAmountIn, depositor.address);
        await instance
          .connect(depositor)
          .approve(caller.address, ethers.MaxUint256);

        const shareAmount = await instance.balanceOf.staticCall(
          depositor.address,
        );

        const assetAmountOut = await instance
          .connect(depositor)
          .previewRedeem.staticCall(shareAmount);

        await expect(
          instance
            .connect(caller)
            .redeem(shareAmount, recipient.address, depositor.address),
        )
          .to.emit(instance, 'Withdraw')
          .withArgs(
            caller.address,
            recipient.address,
            depositor.address,
            assetAmountOut,
            shareAmount,
          );
      });

      describe('reverts if', () => {
        it('redeem amount is too large', async () => {
          const shareAmount = 2n;

          await args.mint(depositor.address, shareAmount);

          const max = await instance.maxRedeem.staticCall(depositor.address);

          await expect(
            instance.redeem(max + 1n, recipient.address, depositor.address),
          ).to.be.revertedWithCustomError(
            instance,
            'ERC4626Base__MaximumAmountExceeded',
          );
        });

        it('share amount exceeds allowance', async () => {
          const shareAmount = 2n;

          await args.mint(depositor.address, shareAmount);

          await expect(
            instance
              .connect(caller)
              .redeem(shareAmount, recipient.address, depositor.address),
          ).to.be.revertedWithCustomError(
            instance,
            'ERC4626Base__AllowanceExceeded',
          );
        });
      });
    });
  });
}
