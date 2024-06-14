// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC20BaseInternal } from '../base/ERC20Base.sol';
import { ERC20SnapshotStorage } from './ERC20SnapshotStorage.sol';

/**
 * @title ERC20Snapshot internal functions
 */
abstract contract ERC20SnapshotInternal is ERC20BaseInternal {
    event Snapshot(uint256 id);

    function _snapshot() internal virtual returns (uint256) {
        ERC20SnapshotStorage.Layout storage l = ERC20SnapshotStorage.layout(
            ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT
        );

        l.snapshotId++;

        uint256 current = l.snapshotId;
        emit Snapshot(current);
        return current;
    }

    function _updateAccountSnapshot(address account) private {
        _updateSnapshot(
            ERC20SnapshotStorage
                .layout(ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT)
                .accountBalanceSnapshots[account],
            _balanceOf(account)
        );
    }

    function _updateTotalSupplySnapshot() private {
        _updateSnapshot(
            ERC20SnapshotStorage
                .layout(ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT)
                .totalSupplySnapshots,
            _totalSupply()
        );
    }

    function _updateSnapshot(
        ERC20SnapshotStorage.Snapshots storage snapshots,
        uint256 value
    ) private {
        uint256 current = ERC20SnapshotStorage
            .layout(ERC20SnapshotStorage.DEFAULT_STORAGE_SLOT)
            .snapshotId;

        if (_lastSnapshotId(snapshots.ids) < current) {
            snapshots.ids.push(current);
            snapshots.values.push(value);
        }
    }

    function _lastSnapshotId(
        uint256[] storage ids
    ) private view returns (uint256) {
        return ids.length == 0 ? 0 : ids[ids.length - 1];
    }

    /**
     * @notice ERC20 hook: update snapshot data
     * @inheritdoc ERC20BaseInternal
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        if (from == address(0)) {
            _updateAccountSnapshot(to);
            _updateTotalSupplySnapshot();
        } else if (to == address(0)) {
            _updateAccountSnapshot(from);
            _updateTotalSupplySnapshot();
        } else {
            _updateAccountSnapshot(to);
            _updateAccountSnapshot(from);
        }
    }
}
