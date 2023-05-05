// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IERC4626Internal } from '../../../interfaces/IERC4626Internal.sol';
import { IERC20BaseInternal } from '../../ERC20/base/IERC20BaseInternal.sol';
import { IERC20MetadataInternal } from '../../ERC20/metadata/IERC20MetadataInternal.sol';

/**
 * @title ERC4626 base interface
 */
interface IERC4626BaseInternal is
    IERC4626Internal,
    IERC20BaseInternal,
    IERC20MetadataInternal
{
    error ERC4626Base__MaximumAmountExceeded();
    error ERC4626Base__AllowanceExceeded();
}
