// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library ERC2981Storage {
    struct Layout {
        // token id -> royalty (denominated in basis points)
        mapping(uint256 => uint16) royaltiesBPS;
        uint16 defaultRoyaltyBPS;
        // token id -> receiver address
        mapping(uint256 => address) royaltyReceivers;
        address defaultRoyaltyReceiver;
    }

    bytes32 internal constant DEFAULT_STORAGE_SLOT =
        keccak256(
            abi.encode(
                uint256(
                    keccak256(bytes('solidstate.contracts.storage.ERC2981'))
                ) - 1
            )
        ) & ~bytes32(uint256(0xff));

    function layout() internal pure returns (Layout storage l) {
        l = layout(DEFAULT_STORAGE_SLOT);
    }

    function layout(bytes32 slot) internal pure returns (Layout storage l) {
        assembly {
            l.slot := slot
        }
    }
}
