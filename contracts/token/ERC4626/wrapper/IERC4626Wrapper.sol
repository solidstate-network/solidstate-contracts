// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IERC4626Base } from '../base/IERC4626Base.sol';
import { IERC4626WrapperInternal } from './IERC4626WrapperInternal.sol';

/**
 * @title ERC4626 wrapper interface
 */
interface IERC4626Wrapper is IERC4626Base, IERC4626WrapperInternal {

}
