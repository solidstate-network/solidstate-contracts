// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library IncrementalMerkleTree {
    using IncrementalMerkleTree for Tree;

    struct Tree {
        bytes32[][] __nodes;
    }

    /**
     * @notice query number of elements contained in tree
     * @param t Tree struct storage reference
     * @return treeSize size of tree
     */
    function size(Tree storage t) internal view returns (uint256 treeSize) {
        assembly {
            mstore(0x00, t.slot)
            treeSize := sload(keccak256(0x00, 0x20))
        }
    }

    /**
     * @notice query one-indexed height of tree
     * @dev conventional zero-indexed height would require the use of signed integers, so height is one-indexed instead
     * @param t Tree struct storage reference
     * @return treeHeight one-indexed height of tree
     */
    function height(Tree storage t) internal view returns (uint256 treeHeight) {
        assembly {
            treeHeight := sload(t.slot)
        }
    }

    /**
     * @notice query Merkle root
     * @param t Tree struct storage reference
     * @return hash root hash
     */
    function root(Tree storage t) internal view returns (bytes32 hash) {
        assembly {
            let treeHeight := sload(t.slot)
            if gt(treeHeight, 0) {
                mstore(0x00, t.slot)
                mstore(0x00, add(keccak256(0x00, 0x20), sub(treeHeight, 1)))
                hash := sload(keccak256(0x00, 0x20))
            }
        }
    }

    function at(
        Tree storage t,
        uint256 index
    ) internal view returns (bytes32 hash) {
        if (index >= t.size()) {
            new bytes32[](0)[1];
        }

        assembly {
            mstore(0x00, t.slot)
            mstore(0x00, keccak256(0x00, 0x20))
            hash := sload(add(keccak256(0x00, 0x20), index))
        }
    }

    /**
     * @notice add new element to tree
     * @param t Tree struct storage reference
     * @param hash to add
     */
    function push(Tree storage t, bytes32 hash) internal {
        // index to add to tree
        uint256 updateIndex = t.size();

        // update stored tree size

        assembly {
            mstore(0x00, t.slot)
            sstore(keccak256(0x00, 0x20), add(updateIndex, 1))
        }

        // add new layer if tree is at capacity

        uint256 treeHeight = t.height();

        if (updateIndex == (1 << treeHeight) >> 1) {
            // increment tree height in storage
            assembly {
                sstore(t.slot, add(treeHeight, 1))
            }
        }

        // add hash to tree

        t.set(updateIndex, hash);
    }

    function pop(Tree storage t) internal {
        uint256 treeSize = t.size();

        if (treeSize == 0) {
            new bytes32[](0)[1];
        }

        unchecked {
            // index to remove from tree
            uint256 updateIndex = treeSize - 1;

            // update stored tree size

            assembly {
                mstore(0x00, t.slot)
                sstore(keccak256(0x00, 0x20), updateIndex)
            }

            // if new tree is full, remove excess layer
            // if no layer is removed, recalculate hashes

            uint256 treeHeight = t.height();

            if (updateIndex == (1 << treeHeight) >> 2) {
                // decrement tree height in storage
                assembly {
                    sstore(t.slot, sub(treeHeight, 1))
                }
            } else {
                t.set(updateIndex - 1, t.at(updateIndex - 1));
            }
        }
    }

    /**
     * @notice update existing element in tree
     * @param t Tree struct storage reference
     * @param index index to update
     * @param hash new hash to add
     */
    function set(Tree storage t, uint256 index, bytes32 hash) internal {
        uint256 treeSize = t.size();

        if (index >= treeSize) {
            new bytes32[](0)[1];
        }

        _set(t, 0, index, treeSize, hash);
    }

    /**
     * @notice update element in tree and recursively recalculate hashes
     * @param t Tree struct storage reference
     * @param rowIndex index of current row to update
     * @param colIndex index of current column to update
     * @param rowLength length of row at rowIndex
     * @param hash hash to store at current position
     */
    function _set(
        Tree storage t,
        uint256 rowIndex,
        uint256 colIndex,
        uint256 rowLength,
        bytes32 hash
    ) private {
        bytes32[] storage row;

        assembly {
            mstore(0x00, t.slot)
            row.slot := add(keccak256(0x00, 0x20), rowIndex)
        }

        // store hash in array via assembly to avoid array length sload

        assembly {
            mstore(0x00, row.slot)
            sstore(add(keccak256(0x00, 0x20), colIndex), hash)
        }

        if (rowLength == 1) return;

        unchecked {
            if (colIndex & 1 == 1) {
                // sibling is on the left
                assembly {
                    let sibling := sload(
                        add(keccak256(0x00, 0x20), sub(colIndex, 1))
                    )
                    mstore(0x00, sibling)
                    mstore(0x20, hash)
                    hash := keccak256(0x00, 0x40)
                }
            } else if (colIndex < rowLength - 1) {
                // sibling is on the right (and sibling exists)
                assembly {
                    let sibling := sload(
                        add(keccak256(0x00, 0x20), add(colIndex, 1))
                    )
                    mstore(0x00, hash)
                    mstore(0x20, sibling)
                    hash := keccak256(0x00, 0x40)
                }
            }
        }

        _set(t, rowIndex + 1, colIndex >> 1, (rowLength + 1) >> 1, hash);
    }
}
