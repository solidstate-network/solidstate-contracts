// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { ERC4626Base } from '../base/ERC4626Base.sol';
import { ERC4626BaseInternal } from '../base/ERC4626BaseInternal.sol';
import { ERC4626WrapperInternal } from './ERC4626WrapperInternal.sol';

/**
 * @title ERC4626 functions implemented for 1:1 token wrappers
 */
contract ERC4626Wrapper is ERC4626Base, ERC4626WrapperInternal {
    function _convertToAssets(
        uint256 shareAmount
    )
        internal
        view
        override(ERC4626BaseInternal, ERC4626WrapperInternal)
        returns (uint256 assetAmount)
    {
        assetAmount = super._convertToAssets(shareAmount);
    }

    function _convertToShares(
        uint256 assetAmount
    )
        internal
        view
        override(ERC4626BaseInternal, ERC4626WrapperInternal)
        returns (uint256 shareAmount)
    {
        shareAmount = super._convertToAssets(assetAmount);
    }

    function _previewMint(
        uint256 shareAmount
    )
        internal
        view
        override(ERC4626BaseInternal, ERC4626WrapperInternal)
        returns (uint256 assetAmount)
    {
        assetAmount = super._previewMint(shareAmount);
    }

    function _previewWithdraw(
        uint256 assetAmount
    )
        internal
        view
        override(ERC4626BaseInternal, ERC4626WrapperInternal)
        returns (uint256 shareAmount)
    {
        shareAmount = super._previewMint(assetAmount);
    }
}
