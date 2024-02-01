// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { PackedDoublyLinkedList } from './PackedDoublyLinkedList.sol';

contract PackedDoublyLinkedListUint128Mock {
    using PackedDoublyLinkedList for PackedDoublyLinkedList.Uint128List;

    PackedDoublyLinkedList.Uint128List private self;

    function contains(uint128 value) external view returns (bool) {
        return self.contains(value);
    }

    function prev(uint128 value) external view returns (uint128) {
        return self.prev(value);
    }

    function next(uint128 value) external view returns (uint128) {
        return self.next(value);
    }

    function insertBefore(
        uint128 nextValue,
        uint128 newValue
    ) external returns (bool) {
        return self.insertBefore(nextValue, newValue);
    }

    function insertAfter(
        uint128 prevValue,
        uint128 newValue
    ) external returns (bool) {
        return self.insertAfter(prevValue, newValue);
    }

    function push(uint128 value) external returns (bool) {
        return self.push(value);
    }

    function pop() external returns (uint128) {
        return self.pop();
    }

    function shift() external returns (uint128) {
        return self.shift();
    }

    function unshift(uint128 value) external returns (bool) {
        return self.unshift(value);
    }

    function remove(uint128 value) external returns (bool) {
        return self.remove(value);
    }

    function replace(
        uint128 oldValue,
        uint128 newValue
    ) external returns (bool) {
        return self.replace(oldValue, newValue);
    }
}
