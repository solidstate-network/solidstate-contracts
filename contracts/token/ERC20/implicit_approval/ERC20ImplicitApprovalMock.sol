// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC20ImplicitApproval } from './ERC20ImplicitApproval.sol';
import { ERC20ImplicitApprovalStorage } from './ERC20ImplicitApprovalStorage.sol';

contract ERC20ImplicitApprovalMock is ERC20ImplicitApproval {
    constructor(address[] memory approvedAccounts) {
        ERC20ImplicitApprovalStorage.Layout
            storage l = ERC20ImplicitApprovalStorage.layout(
                ERC20ImplicitApprovalStorage.DEFAULT_STORAGE_SLOT
            );

        for (uint256 i; i < approvedAccounts.length; i++) {
            l.implicitApprovals[approvedAccounts[i]] = true;
        }
    }

    function __isImplicitlyApproved(
        address account
    ) external view returns (bool) {
        return _isImplicitlyApproved(account);
    }

    function __mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function __burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
