import { ethers } from 'hardhat';
import { describeBehaviorOfERC1404 } from '@solidstate/spec';
import { ERC1404Mock, ERC1404Mock__factory } from '@solidstate/types';

let restrictions = [
  { code: ethers.BigNumber.from(1), message: 'one' },
  { code: ethers.BigNumber.from(3), message: 'three' },
];

describe('ERC1404', function () {
  let instance: ERC1404Mock;

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    instance = await new ERC1404Mock__factory(deployer).deploy(
      restrictions.map((r) => r.code),
      restrictions.map((r) => r.message),
    );
  });

  describeBehaviorOfERC1404({
    deploy: async () => instance,
    mint: (recipient, amount) =>
      instance['mint(address,uint256)'](recipient, amount),
    burn: (recipient, amount) =>
      instance['burn(address,uint256)'](recipient, amount),
    restrictions,
    name: '',
    symbol: '',
    decimals: 0,
    supply: ethers.constants.Zero,
  });
});
