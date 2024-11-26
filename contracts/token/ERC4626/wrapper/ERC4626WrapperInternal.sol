// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import { ERC4626BaseInternal } from '../base/ERC4626BaseInternal.sol';
import { IERC4626WrapperInternal } from './IERC4626WrapperInternal.sol';

/**
 * @title ERC4626 internal functions implemented for 1:1 token wrappers
 */
contract ERC4626WrapperInternal is
    ERC4626BaseInternal,
    IERC4626WrapperInternal
{
    /**
     * @inheritdoc ERC4626BaseInternal
     * @dev assets and shares are pegged 1:1, so this override is made for gas savings
     */
    function _totalAssets() internal view override returns (uint256) {
        return _totalSupply();
    }

    /**
     * @inheritdoc ERC4626BaseInternal
     * @dev assets and shares are pegged 1:1, so this override is made for gas savings
     */
    function _convertToAssets(
        uint256 shareAmount
    ) internal view virtual override returns (uint256 assetAmount) {
        assetAmount = shareAmount;
    }

    /**
     * @inheritdoc ERC4626BaseInternal
     * @dev assets and shares are pegged 1:1, so this override is made for gas savings
     */
    function _convertToShares(
        uint256 assetAmount
    ) internal view virtual override returns (uint256 shareAmount) {
        shareAmount = assetAmount;
    }

    /**
     * @inheritdoc ERC4626BaseInternal
     * @dev assets and shares are pegged 1:1, so this function acts as an alias of _previewDeposit
     */
    function _previewMint(
        uint256 shareAmount
    ) internal view virtual override returns (uint256 assetAmount) {
        assetAmount = _previewDeposit(shareAmount);
    }

    /**
     * @inheritdoc ERC4626BaseInternal
     * @dev assets and shares are pegged 1:1, so this function acts as an alias of _previewRedeem
     */
    function _previewWithdraw(
        uint256 assetAmount
    ) internal view virtual override returns (uint256 shareAmount) {
        shareAmount = _previewRedeem(assetAmount);
    }
}
