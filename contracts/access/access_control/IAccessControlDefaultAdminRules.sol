// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { IAccessControl } from './IAccessControl.sol';
import { IAccessControlDefaultAdminRulesInternal } from './IAccessControlDefaultAdminRulesInternal.sol';

/**
 * @title AccessControlDefaultAdminRules interface
 */
interface IAccessControlDefaultAdminRules is
    IAccessControlDefaultAdminRulesInternal,
    IAccessControl
{
    /**
     * @notice query default admin
     * @return defaultAdmin the default admin
     */
    function defaultAdmin() external view returns (address);

    /**
     * @notice query pending default admin
     * @return newAdmin pending default admin
     * @return acceptSchedule acceptance schedule
     */
    function pendingDefaultAdmin()
        external
        view
        returns (address newAdmin, uint48 acceptSchedule);

    /**
     * @notice query default admin delay
     * @return defaultAdminDelay default admin delay
     */
    function defaultAdminDelay() external view returns (uint48);

    /**
     * @notice query pending default admin delay
     * @return newDelay default admin delay
     * @return effectSchedule effect schedule
     */
    function pendingDefaultAdminDelay()
        external
        view
        returns (uint48 newDelay, uint48 effectSchedule);

    /**
     * @notice start a default admin transfer
     * @param newAdmin new admin
     */
    function beginDefaultAdminTransfer(address newAdmin) external;

    /**
     * @notice cancel a default admin transfer
     */
    function cancelDefaultAdminTransfer() external;

    /**
     * @notice accept a default admin transfer
     */
    function acceptDefaultAdminTransfer() external;

    /**
     * @notice change a default admin delay
     * @param newDelay new delay
     */
    function changeDefaultAdminDelay(uint48 newDelay) external;

    /**
     * @notice roll back a default admin delay
     */
    function rollbackDefaultAdminDelay() external;

    /**
     * @notice query default admin delay wait
     * @return wait wait
     */
    function defaultAdminDelayIncreaseWait() external view returns (uint48);
}
