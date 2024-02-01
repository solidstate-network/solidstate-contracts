import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { setBalance } from '@nomicfoundation/hardhat-network-helpers';
import { deployMockContract } from '@solidstate/library';
import {
  AddressUtilsMock,
  AddressUtilsMock__factory,
  OwnableMock,
  OwnableMock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { BytesLike } from 'ethers';
import { ethers } from 'hardhat';

describe('AddressUtils', async () => {
  let instance: AddressUtilsMock;
  let implementation: OwnableMock;
  let deployer: SignerWithAddress;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
    instance = await new AddressUtilsMock__factory(deployer).deploy();
    implementation = await new OwnableMock__factory(deployer).deploy(
      deployer.address,
    );
  });

  describe('__internal', () => {
    describe('#toString(address)', () => {
      it('returns a string from an address', async () => {
        expect(
          ethers.getAddress(
            await instance['toString(address)'].staticCall(deployer.address),
          ),
        ).to.eq(deployer.address);
      });
    });

    describe('#isContract(address)', () => {
      it('returns true when an address is a contract', async () => {
        expect(await instance.isContract(await instance.getAddress())).to.be
          .true;
      });

      it('returns false when an address is not a contract', async () => {
        expect(await instance.isContract(deployer.address)).to.be.false;
      });
    });

    describe('#sendValue(address,uint256)', () => {
      it('transfers given value to given address', async () => {
        const value = 2n;

        await setBalance(await instance.getAddress(), value);

        const target = deployer;

        await expect(() =>
          instance.connect(deployer).sendValue(target.address, value),
        ).to.changeEtherBalances([instance, target], [-value, value]);
      });

      describe('reverts if', () => {
        it('target contract rejects transfer', async () => {
          const value = 2n;

          await setBalance(await instance.getAddress(), value);

          const mock = await deployMockContract(deployer, []);

          // TODO: after ethers v6 upgrade, revert no longer occurs when sending value to mock

          await expect(
            instance
              .connect(deployer)
              .sendValue(await instance.getAddress(), value),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__SendValueFailed',
          );
        });
      });
    });

    describe('#functionCall(address,bytes)', () => {
      it('returns the bytes representation of the return value of the target function', async () => {
        const mock = await deployMockContract(deployer, [
          'function fn() external returns (bool)',
        ]);

        await mock.mock.fn.returns(true);

        const target = mock.address;
        const { data } = (await mock.populateTransaction.fn()) as {
          data: BytesLike;
        };

        expect(
          await instance
            .connect(deployer)
            ['functionCall(address,bytes)'].staticCall(target, data),
        ).to.equal(ethers.zeroPadValue('0x01', 32));
      });

      describe('reverts if', () => {
        it('target is not a contract', async () => {
          await expect(
            instance['functionCall(address,bytes)'](ethers.ZeroAddress, '0x'),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );
        });

        it('target contract reverts, with target contract error message', async () => {
          const revertReason = 'REVERT_REASON';

          const mock = await deployMockContract(deployer, [
            'function fn () external payable returns (bool)',
          ]);

          await mock.mock.fn.revertsWithReason(revertReason);

          const target = mock.address;
          const { data } = (await mock.populateTransaction.fn()) as {
            data: BytesLike;
          };

          await expect(
            instance
              .connect(deployer)
              ['functionCall(address,bytes)'](target, data),
          ).to.be.revertedWith(revertReason);
        });

        it('target contract reverts, with default error message', async () => {
          await expect(
            instance
              .connect(deployer)
              ['functionCall(address,bytes)'](
                await instance.getAddress(),
                '0x',
              ),
          ).to.be.revertedWith('AddressUtils: failed low-level call');
        });
      });
    });

    describe('#functionCall(address,bytes,string)', () => {
      it('returns the bytes representation of the return value of the target function', async () => {
        const mock = await deployMockContract(deployer, [
          'function fn () external payable returns (bool)',
        ]);
        const revertReason = 'REVERT_REASON';

        await mock.mock.fn.returns(true);

        const target = mock.address;
        const { data } = (await mock.populateTransaction.fn()) as {
          data: BytesLike;
        };

        expect(
          await instance
            .connect(deployer)
            ['functionCall(address,bytes,string)'].staticCall(
              target,
              data,
              revertReason,
            ),
        ).to.equal(ethers.zeroPadValue('0x01', 32));
      });

      describe('reverts if', () => {
        it('target is not a contract', async () => {
          await expect(
            instance['functionCall(address,bytes,string)'](
              ethers.ZeroAddress,
              '0x',
              '',
            ),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );
        });

        it('target contract reverts, with target contract error message', async () => {
          const revertReason = 'REVERT_REASON';

          const mock = await deployMockContract(deployer, [
            'function fn () external payable returns (bool)',
          ]);

          await mock.mock.fn.revertsWithReason(revertReason);

          const target = mock.address;
          const { data } = (await mock.populateTransaction.fn()) as {
            data: BytesLike;
          };

          await expect(
            instance
              .connect(deployer)
              ['functionCall(address,bytes,string)'](target, data, ''),
          ).to.be.revertedWith(revertReason);
        });

        it('target contract reverts, with provided error message', async () => {
          const revertReason = 'REVERT_REASON';

          await expect(
            instance
              .connect(deployer)
              ['functionCall(address,bytes,string)'](
                await instance.getAddress(),
                '0x',
                revertReason,
              ),
          ).to.be.revertedWith(revertReason);
        });
      });
    });

    describe('#functionCallWithValue(address,bytes,uint256)', () => {
      it('returns the bytes representation of the return value of the target function', async () => {
        const mock = await deployMockContract(deployer, [
          'function fn () external payable returns (bool)',
        ]);

        await mock.mock.fn.returns(true);

        const target = mock.address;
        const { data } = (await mock.populateTransaction.fn()) as {
          data: BytesLike;
        };

        expect(
          await instance
            .connect(deployer)
            ['functionCallWithValue(address,bytes,uint256)'].staticCall(
              target,
              data,
              0,
            ),
        ).to.equal(ethers.zeroPadValue('0x01', 32));
      });

      it('transfers given value to target contract', async () => {
        const value = 2n;

        await setBalance(await instance.getAddress(), value);

        const mock = await deployMockContract(deployer, [
          'function fn () external payable returns (bool)',
        ]);

        await mock.mock.fn.returns(true);

        const target = mock.address;
        const mocked = await mock.populateTransaction.fn();
        const data = mocked.data as BytesLike;

        await expect(() =>
          instance
            .connect(deployer)
            ['functionCallWithValue(address,bytes,uint256)'](
              target,
              data,
              value,
            ),
        ).to.changeEtherBalances([instance, mock], [-value, value]);
      });

      describe('reverts if', () => {
        it('target is not a contract', async () => {
          await expect(
            instance['functionCallWithValue(address,bytes,uint256)'](
              ethers.ZeroAddress,
              '0x',
              0,
            ),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );
        });

        it('contract balance is insufficient for the call', async () => {
          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256)'](
                await instance.getAddress(),
                '0x',
                1,
              ),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__InsufficientBalance',
          );
        });

        it('target function is not payable and value is included', async () => {
          const value = 2n;

          await setBalance(await instance.getAddress(), value);

          const targetContract = await new AddressUtilsMock__factory(
            deployer,
          ).deploy();

          const target = await targetContract.getAddress();

          // the sendValue function is used as a transaction target because it is itself nonpayable

          const { data } = (await targetContract.sendValue.populateTransaction(
            ethers.ZeroAddress,
            0,
          )) as { data: BytesLike };

          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256)'](
                target,
                data,
                value,
              ),
          ).to.be.revertedWith(
            'AddressUtils: failed low-level call with value',
          );
        });

        it('target contract reverts, with target contract error message', async () => {
          const revertReason = 'REVERT_REASON';

          const mock = await deployMockContract(deployer, [
            'function fn () external payable returns (bool)',
          ]);

          await mock.mock.fn.revertsWithReason(revertReason);

          const target = mock.address;
          const { data } = (await mock.populateTransaction.fn()) as {
            data: BytesLike;
          };

          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256)'](target, data, 0),
          ).to.be.revertedWith(revertReason);
        });

        it('target contract reverts, with default error message', async () => {
          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256)'](
                await instance.getAddress(),
                '0x',
                0,
              ),
          ).to.be.revertedWith(
            'AddressUtils: failed low-level call with value',
          );
        });
      });
    });

    describe('#functionCallWithValue(address,bytes,uint256,string)', () => {
      it('returns the bytes representation of the return value of the target function', async () => {
        const mock = await deployMockContract(deployer, [
          'function fn () external payable returns (bool)',
        ]);

        await mock.mock.fn.returns(true);

        const target = mock.address;
        const { data } = (await mock.populateTransaction.fn()) as {
          data: BytesLike;
        };

        expect(
          await instance
            .connect(deployer)
            ['functionCallWithValue(address,bytes,uint256,string)'].staticCall(
              target,
              data,
              0,
              '',
            ),
        ).to.equal(ethers.zeroPadValue('0x01', 32));
      });

      it('transfers given value to target contract', async () => {
        const value = 2n;

        await setBalance(await instance.getAddress(), value);

        const mock = await deployMockContract(deployer, [
          'function fn () external payable returns (bool)',
        ]);

        await mock.mock.fn.returns(true);

        const target = mock.address;
        const { data } = (await mock.populateTransaction.fn()) as {
          data: BytesLike;
        };

        await expect(() =>
          instance
            .connect(deployer)
            ['functionCallWithValue(address,bytes,uint256,string)'](
              target,
              data,
              value,
              '',
            ),
        ).to.changeEtherBalances([instance, mock], [-value, value]);
      });

      describe('reverts if', () => {
        it('target is not a contract', async () => {
          await expect(
            instance['functionCallWithValue(address,bytes,uint256,string)'](
              ethers.ZeroAddress,
              '0x',
              0,
              '',
            ),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );
        });

        it('contract balance is insufficient for the call', async () => {
          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256,string)'](
                await instance.getAddress(),
                '0x',
                1,
                '',
              ),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__InsufficientBalance',
          );
        });

        it('target function is not payable and value is included', async () => {
          const value = 2n;
          const revertReason = 'REVERT_REASON';

          await setBalance(await instance.getAddress(), value);

          const targetContract = await new AddressUtilsMock__factory(
            deployer,
          ).deploy();

          const target = await targetContract.getAddress();

          // the sendValue function is used as a transaction target because it is itself nonpayable

          const { data } = (await targetContract.sendValue.populateTransaction(
            ethers.ZeroAddress,
            0,
          )) as { data: BytesLike };

          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256,string)'](
                target,
                data,
                value,
                revertReason,
              ),
          ).to.be.revertedWith(revertReason);
        });

        it('target contract reverts, with target contract error message', async () => {
          const revertReason = 'REVERT_REASON';

          const mock = await deployMockContract(deployer, [
            'function fn () external payable returns (bool)',
          ]);

          await mock.mock.fn.revertsWithReason(revertReason);

          const target = mock.address;
          const { data } = (await mock.populateTransaction.fn()) as {
            data: BytesLike;
          };

          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256,string)'](
                target,
                data,
                0,
                '',
              ),
          ).to.be.revertedWith(revertReason);
        });

        it('target contract reverts, with provided error message', async () => {
          const revertReason = 'REVERT_REASON';

          await expect(
            instance
              .connect(deployer)
              ['functionCallWithValue(address,bytes,uint256,string)'](
                await instance.getAddress(),
                '0x',
                0,
                revertReason,
              ),
          ).to.be.revertedWith(revertReason);
        });
      });
    });

    describe('#functionDelegateCall(address,bytes)', () => {
      it('returns the bytes representation of the return value of the target function', async () => {
        expect(await implementation.owner()).to.equal(deployer);

        const target = await implementation.getAddress();

        {
          const { data } = (await implementation.__setOwner.populateTransaction(
            ethers.ZeroAddress,
          )) as {
            data: BytesLike;
          };

          await instance.functionDelegateCall(target, data);
        }

        const { data } = (await implementation.owner.populateTransaction()) as {
          data: BytesLike;
        };

        expect(await instance.functionDelegateCall(target, data)).to.equal(
          ethers.zeroPadValue(ethers.hexlify(ethers.ZeroAddress), 32),
        );
      });

      describe('reverts if', () => {
        it('target is not a contract', async () => {
          await expect(
            instance.functionDelegateCall(ethers.ZeroAddress, '0x'),
          ).to.be.revertedWithCustomError(
            instance,
            'AddressUtils__NotContract',
          );
        });

        it('target contract reverts, with target contract error message', async () => {
          const revertReason = 'REVERT_REASON';

          const mock = await deployMockContract(deployer, [
            'function fn() external payable returns (bool)',
          ]);

          await mock.mock.fn.revertsWithReason(revertReason);

          const target = mock.address;
          const { data } = (await mock.populateTransaction.fn()) as {
            data: BytesLike;
          };

          console.log(data);

          await expect(
            instance.connect(deployer).functionDelegateCall(target, data),
          ).to.be.revertedWith(revertReason);
        });

        it('target contract reverts, with default error message', async () => {
          await expect(
            instance
              .connect(deployer)
              .functionDelegateCall(await instance.getAddress(), '0x'),
          ).to.be.revertedWith('AddressUtils: failed low-level delegatecall');
        });
      });
    });
  });
});
