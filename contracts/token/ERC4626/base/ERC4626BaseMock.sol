// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { ERC20MetadataStorage } from '../../ERC20/metadata/ERC20MetadataStorage.sol';
import { ERC4626Base } from './ERC4626Base.sol';
import { ERC4626BaseStorage } from './ERC4626BaseStorage.sol';

contract ERC4626BaseMock is ERC4626Base {
    event AfterDepositCheck(
        address receiver,
        uint256 assetAmount,
        uint256 shareAmount
    );
    event BeforeWithdrawCheck(
        address owner,
        uint256 assetAmount,
        uint256 shareAmount
    );

    constructor(
        address asset,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) {
        ERC4626BaseStorage
            .layout(ERC4626BaseStorage.DEFAULT_STORAGE_SLOT)
            .asset = asset;

        ERC20MetadataStorage.Layout storage l = ERC20MetadataStorage.layout(
            ERC20MetadataStorage.DEFAULT_STORAGE_SLOT
        );
        l.name = name;
        l.symbol = symbol;
        l.decimals = decimals;
    }

    function _totalAssets() internal view override returns (uint256) {
        return _totalSupply();
    }

    function _afterDeposit(
        address receiver,
        uint256 assetAmount,
        uint256 shareAmount
    ) internal override {
        super._afterDeposit(receiver, assetAmount, shareAmount);
        emit AfterDepositCheck(receiver, assetAmount, shareAmount);
    }

    function _beforeWithdraw(
        address owner,
        uint256 assetAmount,
        uint256 shareAmount
    ) internal override {
        super._beforeWithdraw(owner, assetAmount, shareAmount);
        emit BeforeWithdrawCheck(owner, assetAmount, shareAmount);
    }

    function __mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function __burn(address account, uint256 amount) external {
        _burn(account, amount);
    }
}
