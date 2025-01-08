// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

library AccessControlDefaultAdminRulesStorage {
    struct Layout {
        address pendingDefaultAdmin;
        uint48 pendingDefaultAdminSchedule;
        uint48 currentDelay;
        address currentDefaultAdmin;
        uint48 pendingDelay;
        uint48 pendingDelaySchedule;
    }

    bytes32 internal constant DEFAULT_ADMIN_ROLE = 0x00;

    bytes32 internal constant STORAGE_SLOT =
        keccak256(
            'solidstate.contracts.storage.AccessControlDefaultAdminRules'
        );

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
