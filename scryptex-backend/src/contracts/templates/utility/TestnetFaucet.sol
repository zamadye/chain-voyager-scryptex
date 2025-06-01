
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TestnetFaucet
 * @dev Faucet contract for distributing testnet tokens
 */
contract TestnetFaucet is Ownable, ReentrancyGuard {
    uint256 public constant ETH_DRIP_AMOUNT = 0.1 ether;
    uint256 public constant TOKEN_DRIP_AMOUNT = 100 * 10**18;
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    
    mapping(address => uint256) public lastDripTime;
    mapping(address => uint256) public totalDrips;
    mapping(address => bool) public authorizedTokens;
    
    address[] public supportedTokens;
    uint256 public totalUsers;
    uint256 public totalETHDistributed;
    uint256 public totalTokensDistributed;
    
    event ETHDripped(address indexed recipient, uint256 amount);
    event TokenDripped(address indexed token, address indexed recipient, uint256 amount);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FaucetFunded(address indexed funder, uint256 amount);
    
    modifier canDrip() {
        require(
            block.timestamp >= lastDripTime[msg.sender] + COOLDOWN_PERIOD,
            "Cooldown period not over"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    function dripETH() public canDrip nonReentrant {
        require(address(this).balance >= ETH_DRIP_AMOUNT, "Insufficient ETH in faucet");
        
        lastDripTime[msg.sender] = block.timestamp;
        if (totalDrips[msg.sender] == 0) {
            totalUsers++;
        }
        totalDrips[msg.sender]++;
        totalETHDistributed += ETH_DRIP_AMOUNT;
        
        payable(msg.sender).transfer(ETH_DRIP_AMOUNT);
        emit ETHDripped(msg.sender, ETH_DRIP_AMOUNT);
    }
    
    function dripToken(address token) public canDrip nonReentrant {
        require(authorizedTokens[token], "Token not supported");
        
        IERC20 tokenContract = IERC20(token);
        require(
            tokenContract.balanceOf(address(this)) >= TOKEN_DRIP_AMOUNT,
            "Insufficient token balance"
        );
        
        lastDripTime[msg.sender] = block.timestamp;
        if (totalDrips[msg.sender] == 0) {
            totalUsers++;
        }
        totalDrips[msg.sender]++;
        totalTokensDistributed += TOKEN_DRIP_AMOUNT;
        
        tokenContract.transfer(msg.sender, TOKEN_DRIP_AMOUNT);
        emit TokenDripped(token, msg.sender, TOKEN_DRIP_AMOUNT);
    }
    
    function dripBoth() public canDrip nonReentrant {
        require(address(this).balance >= ETH_DRIP_AMOUNT, "Insufficient ETH in faucet");
        require(supportedTokens.length > 0, "No tokens available");
        
        address firstToken = supportedTokens[0];
        IERC20 tokenContract = IERC20(firstToken);
        require(
            tokenContract.balanceOf(address(this)) >= TOKEN_DRIP_AMOUNT,
            "Insufficient token balance"
        );
        
        lastDripTime[msg.sender] = block.timestamp;
        if (totalDrips[msg.sender] == 0) {
            totalUsers++;
        }
        totalDrips[msg.sender]++;
        totalETHDistributed += ETH_DRIP_AMOUNT;
        totalTokensDistributed += TOKEN_DRIP_AMOUNT;
        
        payable(msg.sender).transfer(ETH_DRIP_AMOUNT);
        tokenContract.transfer(msg.sender, TOKEN_DRIP_AMOUNT);
        
        emit ETHDripped(msg.sender, ETH_DRIP_AMOUNT);
        emit TokenDripped(firstToken, msg.sender, TOKEN_DRIP_AMOUNT);
    }
    
    function addToken(address token) public onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!authorizedTokens[token], "Token already added");
        
        authorizedTokens[token] = true;
        supportedTokens.push(token);
        emit TokenAdded(token);
    }
    
    function removeToken(address token) public onlyOwner {
        require(authorizedTokens[token], "Token not supported");
        
        authorizedTokens[token] = false;
        
        // Remove from supportedTokens array
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            if (supportedTokens[i] == token) {
                supportedTokens[i] = supportedTokens[supportedTokens.length - 1];
                supportedTokens.pop();
                break;
            }
        }
        
        emit TokenRemoved(token);
    }
    
    function emergencyWithdrawETH(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    function emergencyWithdrawToken(address token, uint256 amount) public onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    function getCooldownTime(address user) public view returns (uint256) {
        uint256 nextDripTime = lastDripTime[user] + COOLDOWN_PERIOD;
        if (block.timestamp >= nextDripTime) {
            return 0;
        }
        return nextDripTime - block.timestamp;
    }
    
    function getFaucetStats() public view returns (
        uint256 ethBalance,
        uint256 _totalUsers,
        uint256 _totalETHDistributed,
        uint256 _totalTokensDistributed,
        uint256 supportedTokenCount
    ) {
        return (
            address(this).balance,
            totalUsers,
            totalETHDistributed,
            totalTokensDistributed,
            supportedTokens.length
        );
    }
    
    function getSupportedTokens() public view returns (address[] memory) {
        return supportedTokens;
    }
    
    receive() external payable {
        emit FaucetFunded(msg.sender, msg.value);
    }
}
