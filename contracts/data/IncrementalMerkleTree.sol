// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library IncrementalMerkleTree {
    using IncrementalMerkleTree for Tree;

    struct Tree {
        bytes32[][] nodes;
    }

    /**
     * @notice query number of elements contained in tree
     * @param t Tree struct storage reference
     * @return treeSize size of tree
     */
    function size(Tree storage t) internal view returns (uint256 treeSize) {
        bytes32[][] storage nodes = t.nodes;

        assembly {
            mstore(0x00, nodes.slot)
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
        bytes32[][] storage nodes = t.nodes;

        assembly {
            treeHeight := sload(nodes.slot)
        }
    }

    /**
     * @notice query Merkle root
     * @param t Tree struct storage reference
     * @return hash root hash
     */
    function root(Tree storage t) internal view returns (bytes32 hash) {
        bytes32[][] storage nodes = t.nodes;

        uint256 treeHeight = t.height();

        if (treeHeight > 0) {
            assembly {
                mstore(0x00, nodes.slot)
                mstore(0x00, add(keccak256(0x00, 0x20), sub(treeHeight, 1)))
                hash := sload(keccak256(0x00, 0x20))
            }
        }
    }

    function at(
        Tree storage t,
        uint256 index
    ) internal view returns (bytes32 hash) {
        hash = t.nodes[0][index];
    }

    /**
     * @notice add new element to tree
     * @param t Tree struct storage reference
     * @param hash to add
     */
    function push(Tree storage t, bytes32 hash) internal {
        unchecked {
            // index to add to tree
            uint256 updateIndex = t.size();

            // add new layer if tree is at capacity

            if (updateIndex == (1 << t.height()) >> 1) {
                t.nodes.push();
            }

            // add new columns if rows are full

            uint256 row;
            uint256 col = updateIndex;

            while (col == t.nodes[row].length) {
                t.nodes[row].push();
                row++;
                if (col == 0) break;
                col >>= 1;
            }

            // add hash to tree

            t.set(updateIndex, hash);
        }
    }

    function pop(Tree storage t) internal {
        unchecked {
            // index to remove from tree
            uint256 updateIndex = t.size() - 1;

            // remove columns if rows are too long

            uint256 row;
            uint256 col = updateIndex;

            while (col != t.nodes[row].length) {
                t.nodes[row].pop();
                row++;
                col >>= 1;
                if (col == 0) break;
            }

            // if new tree is full, remove excess layer
            // if no layer is removed, recalculate hashes

            if (updateIndex == (1 << t.height()) >> 2) {
                t.nodes.pop();
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
        _set(t.nodes, 0, index, t.size(), hash);
    }

    /**
     * @notice update element in tree and recursively recalculate hashes
     * @param nodes internal tree structure storage reference
     * @param rowIndex index of current row to update
     * @param colIndex index of current column to update
     * @param rowLength length of row at rowIndex
     * @param hash hash to store at current position
     */
    function _set(
        bytes32[][] storage nodes,
        uint256 rowIndex,
        uint256 colIndex,
        uint256 rowLength,
        bytes32 hash
    ) private {
        bytes32[] storage row = nodes[rowIndex];

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
                    mstore(0x00, row.slot)
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
                    mstore(0x00, row.slot)
                    let sibling := sload(
                        add(keccak256(0x00, 0x20), add(colIndex, 1))
                    )
                    mstore(0x00, hash)
                    mstore(0x20, sibling)
                    hash := keccak256(0x00, 0x40)
                }
            }

            _set(
                nodes,
                rowIndex + 1,
                colIndex >> 1,
                (rowLength + 1) >> 1,
                hash
            );
        }
    }
}
