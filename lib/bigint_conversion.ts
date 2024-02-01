import { ethers } from 'hardhat';

export function bigintToAddress(bn: any) {
  return ethers.getAddress(ethers.zeroPadValue(ethers.toBeHex(bn), 20));
}

export function bigintToBytes16(bn: any) {
  return ethers.zeroPadValue(ethers.toBeHex(bn), 16);
}
export function bigintToBytes32(bn: any) {
  return ethers.zeroPadValue(ethers.toBeHex(bn), 32);
}
