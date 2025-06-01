
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TestnetGreeter
 * @dev Simple greeting contract for testnet deployments
 */
contract TestnetGreeter {
    string public greeting;
    address public owner;
    uint256 public greetingCount;
    
    mapping(address => uint256) public userGreetings;
    
    event GreetingChanged(string indexed oldGreeting, string indexed newGreeting, address indexed changer);
    event GreetingCalled(address indexed caller, string greeting);
    
    constructor(string memory _initialGreeting) {
        greeting = _initialGreeting;
        owner = msg.sender;
        greetingCount = 0;
    }
    
    function greet() public returns (string memory) {
        greetingCount++;
        userGreetings[msg.sender]++;
        emit GreetingCalled(msg.sender, greeting);
        return greeting;
    }
    
    function setGreeting(string memory _newGreeting) public {
        string memory oldGreeting = greeting;
        greeting = _newGreeting;
        emit GreetingChanged(oldGreeting, _newGreeting, msg.sender);
    }
    
    function getStats() public view returns (uint256 totalGreetings, uint256 userGreetingCount) {
        return (greetingCount, userGreetings[msg.sender]);
    }
}
