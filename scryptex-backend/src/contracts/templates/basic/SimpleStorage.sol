
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev Basic storage contract for testing deployments
 */
contract SimpleStorage {
    uint256 private _value;
    address public owner;
    
    event ValueChanged(uint256 indexed oldValue, uint256 indexed newValue, address indexed changer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor(uint256 _initialValue) {
        _value = _initialValue;
        owner = msg.sender;
    }
    
    function getValue() public view returns (uint256) {
        return _value;
    }
    
    function setValue(uint256 _newValue) public {
        uint256 oldValue = _value;
        _value = _newValue;
        emit ValueChanged(oldValue, _newValue, msg.sender);
    }
    
    function increment() public {
        _value += 1;
        emit ValueChanged(_value - 1, _value, msg.sender);
    }
    
    function reset() public onlyOwner {
        uint256 oldValue = _value;
        _value = 0;
        emit ValueChanged(oldValue, 0, msg.sender);
    }
}
