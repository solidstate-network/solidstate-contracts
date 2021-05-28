import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deployMockContract } from 'ethereum-waffle';
import { describeBehaviorOfManagedProxy } from '@solidstate/spec';
import {
  ManagedProxyMock,
  ManagedProxyMock__factory,
} from '@solidstate/types';

describe('ManagedProxy', function () {
  let instance: ManagedProxyMock;

  beforeEach(async function () {
    const implementationFactory = await ethers.getContractFactory('Ownable');
    const implementationInstance = await implementationFactory.deploy();
    await implementationInstance.deployed();

    const manager = await deployMockContract((await ethers.getSigners())[0], [
      'function getImplementation () external view returns (address)',
    ]);

    await manager.mock['getImplementation()'].returns(
      implementationInstance.address,
    );

    const selector = manager.interface.getSighash('getImplementation()');

    const [deployer] = await ethers.getSigners();
    instance = await new ManagedProxyMock__factory(deployer).deploy(
      manager.address,
      selector,
    );
  });

  describeBehaviorOfManagedProxy({
    deploy: async () => instance,
    implementationFunction: 'owner()',
    implementationFunctionArgs: [],
  });

  describe('__internal', function () {
    describe('#_getImplementation', function () {
      it('returns implementation address', async function () {
        expect(await instance.callStatic['getImplementation()']()).to.be
          .properAddress;
      });

      describe('reverts if', function () {
        it('manager is non-contract address', async function () {
          await instance.setManager(ethers.constants.AddressZero);

          await expect(instance.callStatic['getImplementation()']()).to.be
            .reverted;
        });

        it('manager fails to return implementation', async function () {
          await instance.setManager(instance.address);

          await expect(
            instance.callStatic['getImplementation()'](),
          ).to.be.revertedWith('ManagedProxy: failed to fetch implementation');
        });
      });
    });
  });
});
