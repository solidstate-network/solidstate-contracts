// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC20BaseInternal } from '../base/ERC20BaseInternal.sol';
import { ERC20ImplicitApprovalStorage } from './ERC20ImplicitApprovalStorage.sol';

/**
 * @title ERC20ImplicitApproval internal functions
 */
abstract contract ERC20ImplicitApprovalInternal is ERC20BaseInternal {
    /**
     * @inheritdoc ERC20BaseInternal
     * @dev internally stored allowance is ignored for implicitly approved spenders
     */
    function _allowance(
        address holder,
        address spender
    ) internal view virtual override returns (uint256) {
        if (_isImplicitlyApproved(spender)) {
            return type(uint256).max;
        } else {
            return super._allowance(holder, spender);
        }
    }

    /**
     * @inheritdoc ERC20BaseInternal
     * @dev internally stored allowance is ignored for implicitly approved spenders
     */
    function _transferFrom(
        address holder,
        address recipient,
        uint256 amount
    ) internal virtual override returns (bool) {
        if (_isImplicitlyApproved(msg.sender)) {
            _transfer(holder, recipient, amount);
            return true;
        } else {
            return super._transferFrom(holder, recipient, amount);
        }
    }

    /**
     * @notice get whether address is implicitly approved to spend tokens
     * @param account address to query
     * @return implicit approval status
     */
    function _isImplicitlyApproved(
        address account
    ) internal view virtual returns (bool) {
        return
            ERC20ImplicitApprovalStorage
                .layout(ERC20ImplicitApprovalStorage.DEFAULT_STORAGE_SLOT)
                .implicitApprovals[account];
    }
}
