import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import {
  AccessControlDefaultAdminRulesMock,
  AccessControlDefaultAdminRulesMock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

describe('AccessControlDefaultAdminRules', () => {
  let defaultAdmin: SignerWithAddress;
  let nonAdmin: SignerWithAddress;
  let nonAdmin2: SignerWithAddress;
  let nonAdmin3: SignerWithAddress;
  let instance: AccessControlDefaultAdminRulesMock;
  const oneDayInSeconds = 86400;

  before(async () => {
    [defaultAdmin, nonAdmin, nonAdmin2, nonAdmin3] = await ethers.getSigners();
  });

  beforeEach(async () => {
    instance = await new AccessControlDefaultAdminRulesMock__factory(
      defaultAdmin,
    ).deploy();
  });

  describe('#grantRole(bytes32,address)', () => {
    it('allows the default admin to grant roles', async () => {
      await instance
        .connect(defaultAdmin)
        .grantRole(ethers.id('ROLE'), nonAdmin.address);
      expect(
        await instance.hasRole(ethers.id('ROLE'), nonAdmin.address),
      ).to.equal(true);
    });

    describe('reverts if', () => {
      it('sender is not default admin', async () => {
        await expect(
          instance
            .connect(nonAdmin)
            .grantRole(ethers.id('ROLE'), nonAdmin.address),
        ).to.be.revertedWith(
          `AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });
    });
  });

  describe('#revokeRole(bytes32,address)', () => {
    it('allows the default admin to revoke roles', async () => {
      await instance
        .connect(defaultAdmin)
        .grantRole(ethers.id('ROLE'), nonAdmin.address);
      await instance
        .connect(defaultAdmin)
        .revokeRole(ethers.id('ROLE'), nonAdmin.address);
      expect(
        await instance.hasRole(ethers.id('ROLE'), nonAdmin.address),
      ).to.equal(false);
    });

    describe('reverts if', () => {
      it('sender is not default admin', async () => {
        await expect(
          instance
            .connect(nonAdmin)
            .grantRole(ethers.id('ROLE'), nonAdmin.address),
        ).to.be.revertedWith(
          `AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });
    });
  });

  describe('#beginDefaultAdminTransfer(address,uint256)', () => {
    it('starts the transfer process', async () => {
      await instance.beginDefaultAdminTransfer(nonAdmin.address);

      const transfer = await instance.pendingDefaultAdmin();
      expect(transfer.newAdmin).to.equal(nonAdmin.address);
      expect(transfer.acceptSchedule).to.be.gt(0); // Ensure end time is set
    });

    describe('reverts if', () => {
      it('sender is not default admin', async () => {
        await expect(
          instance
            .connect(nonAdmin)
            .beginDefaultAdminTransfer(nonAdmin2.address),
        ).to.be.revertedWith(
          `AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });
    });
  });

  describe('#cancelDefaultAdminTransfer()', () => {
    it('cancels the transfer process', async () => {
      await instance.beginDefaultAdminTransfer(nonAdmin.address);
      await instance.cancelDefaultAdminTransfer();

      const transfer = await instance.pendingDefaultAdmin();
      expect(transfer.newAdmin).to.equal(ethers.ZeroAddress);
      expect(transfer.acceptSchedule).to.equal(0);
    });

    describe('reverts if', () => {
      it('sender is not current or pending default admin', async () => {
        await instance.beginDefaultAdminTransfer(nonAdmin.address);

        await expect(
          instance.connect(nonAdmin2).cancelDefaultAdminTransfer(),
        ).to.be.revertedWith(
          `AccessControl: account ${nonAdmin2.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });
    });
  });

  describe('#acceptDefaultAdminTransfer()', () => {
    it('completes the transfer process', async () => {
      await instance.changeDefaultAdminDelay(oneDayInSeconds);
      await ethers.provider.send('evm_increaseTime', [oneDayInSeconds]);
      await ethers.provider.send('evm_mine', []);
      await instance.beginDefaultAdminTransfer(nonAdmin.address);
      await ethers.provider.send('evm_increaseTime', [oneDayInSeconds]);
      await ethers.provider.send('evm_mine', []);
      await instance.connect(nonAdmin).acceptDefaultAdminTransfer();

      expect(await instance.defaultAdmin()).to.equal(nonAdmin.address);
    });

    describe('reverts if', () => {
      it('transfer delay has not passed', async () => {
        await instance.changeDefaultAdminDelay(oneDayInSeconds);
        await ethers.provider.send('evm_increaseTime', [oneDayInSeconds]);
        await ethers.provider.send('evm_mine', []);

        await instance.beginDefaultAdminTransfer(nonAdmin.address);
        await expect(
          instance.connect(nonAdmin).acceptDefaultAdminTransfer(),
        ).to.be.revertedWithCustomError(
          instance,
          'AccessControlEnforcedDefaultAdminDelay',
        );
      });
    });
  });

  describe('#changeDefaultAdminDelay(uint256)', () => {
    it('changes the default admin delay', async () => {
      const newDelay = oneDayInSeconds;
      await instance.changeDefaultAdminDelay(newDelay);
      await ethers.provider.send('evm_increaseTime', [oneDayInSeconds + 1]); // We wait for the newDelay to be set as the new delay
      await ethers.provider.send('evm_mine', []);

      expect(await instance.defaultAdminDelay()).to.equal(newDelay);
    });

    describe('reverts if', () => {
      it('sender is not default admin', async () => {
        await expect(
          instance.connect(nonAdmin).changeDefaultAdminDelay(2000),
        ).to.be.revertedWith(
          `AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });
    });
  });

  describe('#rollbackDefaultAdminDelay()', () => {
    it('rolls back the default admin delay to previous value', async () => {
      const initialDelay = await instance.defaultAdminDelay();
      await instance.changeDefaultAdminDelay(2000);
      await instance.rollbackDefaultAdminDelay();

      expect(await instance.defaultAdminDelay()).to.equal(initialDelay);
    });

    describe('reverts if', () => {
      it('sender is not default admin', async () => {
        await expect(
          instance.connect(nonAdmin).rollbackDefaultAdminDelay(),
        ).to.be.revertedWith(
          `AccessControl: account ${nonAdmin.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`,
        );
      });
    });
  });
});
