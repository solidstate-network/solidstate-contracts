// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IERC2612 } from '../../../interfaces/IERC2612.sol';
import { IERC20Metadata } from '../metadata/IERC20Metadata.sol';
import { IERC20PermitInternal } from './IERC20PermitInternal.sol';

// TODO: note that IERC20Metadata is needed for eth-permit library

interface IERC20Permit is IERC20PermitInternal, IERC2612 {

}
