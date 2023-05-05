// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { IERC20BaseInternal } from './base/IERC20BaseInternal.sol';
import { IERC20ExtendedInternal } from './extended/IERC20ExtendedInternal.sol';
import { IERC20MetadataInternal } from './metadata/IERC20MetadataInternal.sol';
import { IERC20PermitInternal } from './permit/IERC20PermitInternal.sol';

interface ISolidStateERC20Internal is
    IERC20BaseInternal,
    IERC20ExtendedInternal,
    IERC20MetadataInternal,
    IERC20PermitInternal
{}
