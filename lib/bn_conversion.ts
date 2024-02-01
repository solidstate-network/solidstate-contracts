import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

export function bnToAddress(bn: BigNumber) {
  return ethers.utils.getAddress(
    ethers.utils.hexZeroPad(ethers.utils.hexlify(bn), 20),
  );
}

export function bnToBytes16(bn: BigNumber) {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(bn), 16);
}

export function bnToBytes32(bn: BigNumber) {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(bn), 32);
}

export function bytes32ToNumber(bytes32: string | BigNumber) {
  return BigNumber.from(bytes32).toNumber();
}
