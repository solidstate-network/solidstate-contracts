// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC20Base } from '../base/ERC20Base.sol';
import { ERC20MetadataStorage } from '../metadata/ERC20MetadataStorage.sol';
import { ERC20Permit } from './ERC20Permit.sol';

contract ERC20PermitMock is ERC20Permit, ERC20Base {
    constructor(string memory tokenName) {
        ERC20MetadataStorage
            .layout(ERC20MetadataStorage.DEFAULT_STORAGE_SLOT)
            .name = tokenName;
    }

    /**
     * @dev this function does not exist on the interface, but the eth-permit
     *  package calls it directly via function selector
     */
    function name() external view returns (string memory) {
        return _name();
    }

    function setName(string calldata tokenName) external {
        _setName(tokenName);
    }
}
