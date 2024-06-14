// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ISafeOwnableInternal } from './ISafeOwnableInternal.sol';
import { OwnableInternal } from './OwnableInternal.sol';
import { SafeOwnableStorage } from './SafeOwnableStorage.sol';

abstract contract SafeOwnableInternal is ISafeOwnableInternal, OwnableInternal {
    modifier onlyNomineeOwner() {
        if (msg.sender != _nomineeOwner())
            revert SafeOwnable__NotNomineeOwner();
        _;
    }

    /**
     * @notice get the nominated owner who has permission to call acceptOwnership
     */
    function _nomineeOwner() internal view virtual returns (address) {
        return
            SafeOwnableStorage
                .layout(SafeOwnableStorage.DEFAULT_STORAGE_SLOT)
                .nomineeOwner;
    }

    /**
     * @notice accept transfer of contract ownership
     */
    function _acceptOwnership() internal virtual {
        _setOwner(msg.sender);
        delete SafeOwnableStorage
            .layout(SafeOwnableStorage.DEFAULT_STORAGE_SLOT)
            .nomineeOwner;
    }

    /**
     * @notice grant permission to given address to claim contract ownership
     */
    function _transferOwnership(address account) internal virtual override {
        _setNomineeOwner(account);
    }

    /**
     * @notice set nominee owner
     */
    function _setNomineeOwner(address account) internal virtual {
        SafeOwnableStorage
            .layout(SafeOwnableStorage.DEFAULT_STORAGE_SLOT)
            .nomineeOwner = account;
    }
}
