// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { AddressUtils } from '../utils/AddressUtils.sol';
import { IProxy } from './IProxy.sol';

/**
 * @title Base proxy contract
 */
abstract contract Proxy is IProxy {
    using AddressUtils for address;

    fallback() external payable virtual {
        bytes memory returnData = _handleDelegateCall();

        assembly {
            let returnData_size := mload(returnData)
            return(add(32, returnData), returnData_size)
        }
    }

    /**
     * @notice delegate all calls to implementation contract
     */
    function _handleDelegateCall() internal virtual returns (bytes memory) {
        address implementation = _getImplementation();
        return implementation.functionDelegateCall(msg.data);
    }

    /**
     * @notice get logic implementation address
     * @return implementation address
     */
    function _getImplementation() internal virtual returns (address);
}
