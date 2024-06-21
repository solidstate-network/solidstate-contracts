// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library BeaconStorage {
    struct Layout {
        address implementation;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256('solidstate.contracts.storage.Beacon');

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
