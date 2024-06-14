// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title EIP-7201 namespaced storage layout library
 * @dev see https://eips.ethereum.org/EIPS/eip-7201
 */
library ERC7201 {
    /**
     * @notice calculate the EIP-7201 storage slot for a given string id
     * @dev id parameter should not contain whitespace
     * @param id namespace id
     */
    function calculateStorageSlot(
        string memory id
    ) internal pure returns (bytes32 slot) {
        slot =
            keccak256(abi.encode(uint256(keccak256(bytes(id))) - 1)) &
            ~bytes32(uint256(0xff));
    }
}
