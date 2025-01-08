// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { IAccessControlInternal } from './IAccessControlInternal.sol';

/**
 * @title Partial IAccessControlDefaultAdminRules interface needed by internal functions
 */
interface IAccessControlDefaultAdminRulesInternal is IAccessControlInternal {
    error AccessControlInvalidDefaultAdmin(address defaultAdmin);

    error AccessControlEnforcedDefaultAdminRules();

    error AccessControlEnforcedDefaultAdminDelay(uint48 schedule);

    event DefaultAdminTransferScheduled(
        address indexed newAdmin,
        uint48 acceptSchedule
    );

    event DefaultAdminTransferCanceled();

    event DefaultAdminDelayChangeScheduled(
        uint48 newDelay,
        uint48 effectSchedule
    );

    event DefaultAdminDelayChangeCanceled();
}
