// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { Math } from '../../../utils/Math.sol';
import { ERC20SnapshotInternal, ERC20SnapshotStorage } from './ERC20SnapshotInternal.sol';

/**
 * @title ERC20 base implementation with support for token balance and supply snapshots
 */
abstract contract ERC20Snapshot is ERC20SnapshotInternal {
    error ERC20Snapshot__SnapshotIdDoesNotExists();
    error ERC20Snapshot__SnapshotIdIsZero();

    /**
     * @notice query the token balance of given account at given snapshot id
     * @param account address to query
     * @param snapshotId snapshot id to query
     * @return token balance
     */
    function balanceOfAt(
        address account,
        uint256 snapshotId
    ) public view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(
            snapshotId,
            ERC20SnapshotStorage
                .layout(ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT)
                .accountBalanceSnapshots[account]
        );
        return snapshotted ? value : _balanceOf(account);
    }

    /**
     * @notice query the total minted token supply at given snapshot id
     * @param snapshotId snapshot id to query
     * @return token supply
     */
    function totalSupplyAt(uint256 snapshotId) public view returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(
            snapshotId,
            ERC20SnapshotStorage
                .layout(ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT)
                .totalSupplySnapshots
        );
        return snapshotted ? value : _totalSupply();
    }

    function _valueAt(
        uint256 snapshotId,
        ERC20SnapshotStorage.Snapshots storage snapshots
    ) private view returns (bool, uint256) {
        if (snapshotId == 0) revert ERC20Snapshot__SnapshotIdIsZero();
        ERC20SnapshotStorage.Layout storage l = ERC20SnapshotStorage.layout(
            ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT
        );

        if (snapshotId > l.snapshotId)
            revert ERC20Snapshot__SnapshotIdDoesNotExists();

        uint256 index = _findUpperBound(snapshots.ids, snapshotId);

        if (index == snapshots.ids.length) {
            return (false, 0);
        } else {
            return (true, snapshots.values[index]);
        }
    }

    /**
     * @notice find index of first element of array that is greater than or equal to given query
     * @dev array must be sorted in ascending order and contain no duplicates
     * @dev derived from https://github.com/OpenZeppelin/openzeppelin-contracts (MIT license)
     * @param array array to query
     * @param query element to search for
     * @return index of query or array length if query is not found or exceeded
     */
    function _findUpperBound(
        uint256[] storage array,
        uint256 query
    ) private view returns (uint256) {
        unchecked {
            if (array.length == 0) {
                return 0;
            }

            uint256 low = 0;
            uint256 high = array.length;

            while (low < high) {
                uint256 mid = Math.average(low, high);

                if (array[mid] > query) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }

            return (low > 0 && array[low - 1] == query) ? low - 1 : low;
        }
    }
}
