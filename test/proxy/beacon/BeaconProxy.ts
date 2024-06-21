import { deployMockContract } from '@solidstate/library';
import { describeBehaviorOfBeaconProxy } from '@solidstate/spec';
import {
  BeaconProxyMock,
  BeaconProxyMock__factory,
  OwnableMock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('BeaconProxy', () => {
  let beacon: any;
  let instance: BeaconProxyMock;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();

    const implementationInstance = await new OwnableMock__factory(
      deployer,
    ).deploy(ethers.ZeroAddress);

    beacon = await deployMockContract((await ethers.getSigners())[0], [
      'function getImplementation () external view returns (address)',
    ]);

    await beacon.mock.getImplementation.returns(
      await implementationInstance.getAddress(),
    );

    instance = await new BeaconProxyMock__factory(deployer).deploy(
      beacon.address,
    );
  });

  describeBehaviorOfBeaconProxy(async () => instance, {
    implementationFunction: 'owner()',
    implementationFunctionArgs: [],
  });

  describe('__internal', () => {
    describe('#_getImplementation()', () => {
      it('returns implementation address', async () => {
        expect(await instance.__getImplementation.staticCall()).to.be
          .properAddress;
      });

      describe('reverts if', () => {
        it('beacon is non-contract address', async () => {
          await instance.setBeacon(ethers.ZeroAddress);

          await expect(instance.__getImplementation.staticCall()).to.be
            .reverted;
        });
      });
    });
  });
});
