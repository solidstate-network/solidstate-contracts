// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { ISolidStateERC20Internal } from './ISolidStateERC20Internal.sol';
import { ERC20BaseInternal } from './base/ERC20BaseInternal.sol';
import { ERC20ExtendedInternal } from './extended/ERC20ExtendedInternal.sol';
import { ERC20MetadataInternal } from './metadata/ERC20MetadataInternal.sol';
import { ERC20PermitInternal } from './permit/ERC20PermitInternal.sol';

/**
 * @title SolidState ERC20 implementation, including recommended extensions
 */
abstract contract SolidStateERC20Internal is
    ISolidStateERC20Internal,
    ERC20BaseInternal,
    ERC20ExtendedInternal,
    ERC20MetadataInternal,
    ERC20PermitInternal
{

}
