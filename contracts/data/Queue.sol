// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Queue implementation with enumeration functions
 */
library Queue {
    struct QueueInternal {
        mapping(bytes32 => bytes32) _asc;
        mapping(bytes32 => bytes32) _desc;
    }

    struct Bytes32Queue {
        QueueInternal _inner;
    }

    struct AddressQueue {
        QueueInternal _inner;
    }

    struct UintQueue {
        QueueInternal _inner;
    }

    error Queue__InvalidValue();

    function contains(
        Bytes32Queue storage queue,
        bytes32 value
    ) internal view returns (bool) {
        return _contains(queue._inner, value);
    }

    function contains(
        AddressQueue storage queue,
        address value
    ) internal view returns (bool) {
        return _contains(queue._inner, bytes32(uint256(uint160(value))));
    }

    function contains(
        UintQueue storage queue,
        uint256 value
    ) internal view returns (bool) {
        return _contains(queue._inner, bytes32(value));
    }

    function prev(
        Bytes32Queue storage queue,
        bytes32 value
    ) internal view returns (bytes32) {
        return _prev(queue._inner, value);
    }

    function prev(
        AddressQueue storage queue,
        address value
    ) internal view returns (address) {
        return
            address(
                uint160(
                    uint256(
                        _prev(queue._inner, bytes32(uint256(uint160(value))))
                    )
                )
            );
    }

    function prev(
        UintQueue storage queue,
        uint256 value
    ) internal view returns (uint256) {
        return uint256(_prev(queue._inner, bytes32(value)));
    }

    function next(
        Bytes32Queue storage queue,
        bytes32 value
    ) internal view returns (bytes32) {
        return _next(queue._inner, value);
    }

    function next(
        AddressQueue storage queue,
        address value
    ) internal view returns (address) {
        return
            address(
                uint160(
                    uint256(
                        _next(queue._inner, bytes32(uint256(uint160(value))))
                    )
                )
            );
    }

    function next(
        UintQueue storage queue,
        uint256 value
    ) internal view returns (uint256) {
        return uint256(_next(queue._inner, bytes32(value)));
    }

    function insertBefore(
        Bytes32Queue storage queue,
        bytes32 nextValue,
        bytes32 newValue
    ) internal returns (bool status) {
        status = _insertBefore(queue._inner, nextValue, newValue);
    }

    function insertBefore(
        AddressQueue storage queue,
        address nextValue,
        address newValue
    ) internal returns (bool status) {
        status = _insertBefore(
            queue._inner,
            bytes32(uint256(uint160(nextValue))),
            bytes32(uint256(uint160(newValue)))
        );
    }

    function insertBefore(
        UintQueue storage queue,
        uint256 nextValue,
        uint256 newValue
    ) internal returns (bool status) {
        status = _insertBefore(
            queue._inner,
            bytes32(nextValue),
            bytes32(newValue)
        );
    }

    function insertAfter(
        Bytes32Queue storage queue,
        bytes32 prevValue,
        bytes32 newValue
    ) internal returns (bool status) {
        status = _insertAfter(queue._inner, prevValue, newValue);
    }

    function insertAfter(
        AddressQueue storage queue,
        address prevValue,
        address newValue
    ) internal returns (bool status) {
        status = _insertAfter(
            queue._inner,
            bytes32(uint256(uint160(prevValue))),
            bytes32(uint256(uint160(newValue)))
        );
    }

    function insertAfter(
        UintQueue storage queue,
        uint256 prevValue,
        uint256 newValue
    ) internal returns (bool status) {
        status = _insertAfter(
            queue._inner,
            bytes32(prevValue),
            bytes32(newValue)
        );
    }

    function push(
        Bytes32Queue storage queue,
        bytes32 value
    ) internal returns (bool status) {
        status = _push(queue._inner, value);
    }

    function push(
        AddressQueue storage queue,
        address value
    ) internal returns (bool status) {
        status = _push(queue._inner, bytes32(uint256(uint160(value))));
    }

    function push(
        UintQueue storage queue,
        uint256 value
    ) internal returns (bool status) {
        status = _push(queue._inner, bytes32(value));
    }

    function pop(Bytes32Queue storage queue) internal returns (bytes32 value) {
        value = _pop(queue._inner);
    }

    function pop(AddressQueue storage queue) internal returns (address value) {
        value = address(uint160(uint256(_pop(queue._inner))));
    }

    function pop(UintQueue storage queue) internal returns (uint256 value) {
        value = uint256(_pop(queue._inner));
    }

    function shift(
        Bytes32Queue storage queue
    ) internal returns (bytes32 value) {
        value = _shift(queue._inner);
    }

    function shift(
        AddressQueue storage queue
    ) internal returns (address value) {
        value = address(uint160(uint256(_shift(queue._inner))));
    }

    function shift(UintQueue storage queue) internal returns (uint256 value) {
        value = uint256(_shift(queue._inner));
    }

    function unshift(
        Bytes32Queue storage queue,
        bytes32 value
    ) internal returns (bool status) {
        status = _unshift(queue._inner, value);
    }

    function unshift(
        AddressQueue storage queue,
        address value
    ) internal returns (bool status) {
        status = _unshift(queue._inner, bytes32(uint256(uint160(value))));
    }

    function unshift(
        UintQueue storage queue,
        uint256 value
    ) internal returns (bool status) {
        status = _unshift(queue._inner, bytes32(value));
    }

    function remove(
        Bytes32Queue storage queue,
        bytes32 value
    ) internal returns (bool status) {
        status = _remove(queue._inner, value);
    }

    function remove(
        AddressQueue storage queue,
        address value
    ) internal returns (bool status) {
        status = _remove(queue._inner, bytes32(uint256(uint160(value))));
    }

    function remove(
        UintQueue storage queue,
        uint256 value
    ) internal returns (bool status) {
        status = _remove(queue._inner, bytes32(value));
    }

    function _contains(
        QueueInternal storage queue,
        bytes32 value
    ) private view returns (bool) {
        return queue._asc[value] != 0 || queue._desc[0] == value;
    }

    function _prev(
        QueueInternal storage queue,
        bytes32 value
    ) private view returns (bytes32) {
        return queue._desc[value];
    }

    function _next(
        QueueInternal storage queue,
        bytes32 value
    ) private view returns (bytes32) {
        return queue._asc[value];
    }

    function _insertBefore(
        QueueInternal storage queue,
        bytes32 nextValue,
        bytes32 newValue
    ) private returns (bool status) {
        status = _insertBetween(
            queue,
            _prev(queue, nextValue),
            nextValue,
            newValue
        );
    }

    function _insertAfter(
        QueueInternal storage queue,
        bytes32 prevValue,
        bytes32 newValue
    ) private returns (bool status) {
        status = _insertBetween(
            queue,
            prevValue,
            _next(queue, prevValue),
            newValue
        );
    }

    function _insertBetween(
        QueueInternal storage queue,
        bytes32 prevValue,
        bytes32 nextValue,
        bytes32 newValue
    ) private returns (bool status) {
        if (newValue == bytes32(0)) revert Queue__InvalidValue();

        if (!_contains(queue, newValue)) {
            _link(queue, prevValue, newValue);
            _link(queue, newValue, nextValue);
            status = true;
        }
    }

    function _push(
        QueueInternal storage queue,
        bytes32 value
    ) private returns (bool status) {
        status = _insertBetween(queue, _prev(queue, 0), 0, value);
    }

    function _pop(QueueInternal storage queue) private returns (bytes32 value) {
        value = _prev(queue, 0);
        _remove(queue, value);
    }

    function _shift(
        QueueInternal storage queue
    ) private returns (bytes32 value) {
        value = _next(queue, 0);
        _remove(queue, value);
    }

    function _unshift(
        QueueInternal storage queue,
        bytes32 value
    ) private returns (bool status) {
        status = _insertBetween(queue, 0, _next(queue, 0), value);
    }

    function _remove(
        QueueInternal storage queue,
        bytes32 value
    ) private returns (bool status) {
        if (_contains(queue, value)) {
            _link(queue, _prev(queue, value), _next(queue, value));
            delete queue._desc[value];
            delete queue._asc[value];
            status = true;
        }
    }

    function _link(
        QueueInternal storage queue,
        bytes32 prevValue,
        bytes32 nextValue
    ) private {
        queue._asc[prevValue] = nextValue;
        queue._desc[nextValue] = prevValue;
    }
}