
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IBondingCurveFactory {
    function createToken(
        string memory name,
        string memory symbol,
        uint8 curveType,
        uint256 param1,
        uint256 param2,
        uint256 param3
    ) external payable returns (address);
    
    function getAllTokens() external view returns (address[] memory);
}

interface ICrossChainBridge {
    function initiateTransfer(
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChain
    ) external payable returns (bytes32);
    
    function getTransfer(bytes32 transferId) external view returns (
        uint256 transferId,
        address sender,
        address recipient,
        address token,
        uint256 amount,
        uint256 sourceChain,
        uint256 targetChain,
        uint256 timestamp,
        bool processed,
        bytes32 txHash
    );
}

interface IDecentralizedExchange {
    function createPool(
        address tokenA,
        address tokenB,
        uint256 feePercent
    ) external returns (bytes32);
    
    function swapExactTokensForTokens(
        bytes32 poolId,
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut
    ) external returns (uint256 amountOut);
    
    function getAllPools() external view returns (bytes32[] memory);
}

interface IGMSocialProtocol {
    function createProfile(
        string memory username,
        string memory bio,
        string memory avatarURI
    ) external;
    
    function postGM() external returns (bytes32);
    
    function getProfile(address user) external view returns (
        address user,
        string memory username,
        string memory bio,
        string memory avatarURI,
        uint256 followerCount,
        uint256 followingCount,
        uint256 postCount,
        uint256 reputationScore,
        uint256 joinedAt,
        bool isVerified,
        bool isActive
    );
}

contract ScryptexPlatform is Ownable, Pausable, ReentrancyGuard {
    struct UserProfile {
        address user;
        string platformUsername;
        uint256 totalTokensCreated;
        uint256 totalVolumeTraded;
        uint256 totalBridgeTransfers;
        uint256 socialReputationScore;
        uint256 joinedAt;
        bool isActive;
        bool isPremium;
    }
    
    struct PlatformStats {
        uint256 chainId;
        string chainName;
        uint256 totalTokens;
        uint256 totalVolume;
        uint256 totalUsers;
        uint256 totalTransactions;
        bool isActive;
        uint256 lastUpdated;
    }
    
    struct CrossChainActivity {
        address user;
        uint256 sourceChain;
        uint256 targetChain;
        address token;
        uint256 amount;
        uint256 timestamp;
        bytes32 transferId;
    }
    
    // Component contracts
    IBondingCurveFactory public tokenFactory;
    ICrossChainBridge public bridge;
    IDecentralizedExchange public dex;
    IGMSocialProtocol public social;
    
    // Platform data
    mapping(address => UserProfile) public users;
    mapping(uint256 => PlatformStats) public chainStats;
    mapping(address => CrossChainActivity[]) public userActivity;
    
    address[] public allUsers;
    uint256[] public supportedChains;
    CrossChainActivity[] public allActivity;
    
    // Platform settings
    uint256 public platformFeePercent = 100; // 1%
    address public feeRecipient;
    uint256 public premiumFee = 0.1 ether;
    
    // Events
    event UserRegistered(address indexed user, string username);
    event ComponentUpdated(string component, address newAddress);
    event CrossChainActivityRecorded(
        address indexed user,
        uint256 sourceChain,
        uint256 targetChain,
        bytes32 transferId
    );
    event PlatformStatsUpdated(uint256 indexed chainId, uint256 totalTokens, uint256 totalVolume);
    event PremiumUpgrade(address indexed user, uint256 timestamp);
    
    modifier registeredUser() {
        require(users[msg.sender].isActive, "User not registered");
        _;
    }
    
    modifier onlyPremium() {
        require(users[msg.sender].isPremium, "Premium membership required");
        _;
    }
    
    constructor(
        address _feeRecipient
    ) {
        feeRecipient = _feeRecipient;
        
        // Initialize supported chains
        supportedChains.push(6342);    // MegaETH
        supportedChains.push(11155931); // RiseChain
        supportedChains.push(11155111); // Sepolia
        
        // Initialize chain stats
        chainStats[6342] = PlatformStats({
            chainId: 6342,
            chainName: "MegaETH Testnet",
            totalTokens: 0,
            totalVolume: 0,
            totalUsers: 0,
            totalTransactions: 0,
            isActive: true,
            lastUpdated: block.timestamp
        });
        
        chainStats[11155931] = PlatformStats({
            chainId: 11155931,
            chainName: "RiseChain Testnet",
            totalTokens: 0,
            totalVolume: 0,
            totalUsers: 0,
            totalTransactions: 0,
            isActive: true,
            lastUpdated: block.timestamp
        });
        
        chainStats[11155111] = PlatformStats({
            chainId: 11155111,
            chainName: "Sepolia Testnet",
            totalTokens: 0,
            totalVolume: 0,
            totalUsers: 0,
            totalTransactions: 0,
            isActive: true,
            lastUpdated: block.timestamp
        });
    }
    
    // Component Management
    function setTokenFactory(address _tokenFactory) external onlyOwner {
        tokenFactory = IBondingCurveFactory(_tokenFactory);
        emit ComponentUpdated("TokenFactory", _tokenFactory);
    }
    
    function setBridge(address _bridge) external onlyOwner {
        bridge = ICrossChainBridge(_bridge);
        emit ComponentUpdated("Bridge", _bridge);
    }
    
    function setDEX(address _dex) external onlyOwner {
        dex = IDecentralizedExchange(_dex);
        emit ComponentUpdated("DEX", _dex);
    }
    
    function setSocial(address _social) external onlyOwner {
        social = IGMSocialProtocol(_social);
        emit ComponentUpdated("Social", _social);
    }
    
    // User Management
    function registerUser(string memory username) external {
        require(!users[msg.sender].isActive, "User already registered");
        require(bytes(username).length > 0, "Username required");
        
        users[msg.sender] = UserProfile({
            user: msg.sender,
            platformUsername: username,
            totalTokensCreated: 0,
            totalVolumeTraded: 0,
            totalBridgeTransfers: 0,
            socialReputationScore: 0,
            joinedAt: block.timestamp,
            isActive: true,
            isPremium: false
        });
        
        allUsers.push(msg.sender);
        
        // Update chain stats
        chainStats[block.chainid].totalUsers++;
        chainStats[block.chainid].lastUpdated = block.timestamp;
        
        emit UserRegistered(msg.sender, username);
    }
    
    function upgradeToPremium() external payable registeredUser {
        require(msg.value >= premiumFee, "Insufficient fee");
        require(!users[msg.sender].isPremium, "Already premium");
        
        users[msg.sender].isPremium = true;
        
        // Transfer fee
        (bool success, ) = feeRecipient.call{value: msg.value}("");
        require(success, "Fee transfer failed");
        
        emit PremiumUpgrade(msg.sender, block.timestamp);
    }
    
    // Unified Platform Functions
    function createTokenWithPlatform(
        string memory name,
        string memory symbol,
        uint8 curveType,
        uint256 param1,
        uint256 param2,
        uint256 param3
    ) external payable whenNotPaused registeredUser nonReentrant returns (address) {
        require(address(tokenFactory) != address(0), "Token factory not set");
        
        // Create token through factory
        address tokenAddress = tokenFactory.createToken{value: msg.value}(
            name, symbol, curveType, param1, param2, param3
        );
        
        // Update user stats
        users[msg.sender].totalTokensCreated++;
        
        // Update chain stats
        chainStats[block.chainid].totalTokens++;
        chainStats[block.chainid].totalTransactions++;
        chainStats[block.chainid].lastUpdated = block.timestamp;
        
        return tokenAddress;
    }
    
    function crossChainTransfer(
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChain
    ) external payable whenNotPaused registeredUser nonReentrant returns (bytes32) {
        require(address(bridge) != address(0), "Bridge not set");
        require(chainStats[targetChain].isActive, "Target chain not supported");
        
        // Initiate bridge transfer
        bytes32 transferId = bridge.initiateTransfer{value: msg.value}(
            recipient, token, amount, targetChain
        );
        
        // Record activity
        CrossChainActivity memory activity = CrossChainActivity({
            user: msg.sender,
            sourceChain: block.chainid,
            targetChain: targetChain,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            transferId: transferId
        });
        
        userActivity[msg.sender].push(activity);
        allActivity.push(activity);
        
        // Update user stats
        users[msg.sender].totalBridgeTransfers++;
        
        // Update chain stats
        chainStats[block.chainid].totalTransactions++;
        chainStats[block.chainid].lastUpdated = block.timestamp;
        
        emit CrossChainActivityRecorded(msg.sender, block.chainid, targetChain, transferId);
        
        return transferId;
    }
    
    function swapTokensOnPlatform(
        bytes32 poolId,
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut
    ) external whenNotPaused registeredUser nonReentrant returns (uint256) {
        require(address(dex) != address(0), "DEX not set");
        
        uint256 amountOut = dex.swapExactTokensForTokens(
            poolId, amountIn, amountOutMin, tokenIn, tokenOut
        );
        
        // Update user stats
        users[msg.sender].totalVolumeTraded += amountIn;
        
        // Update chain stats
        chainStats[block.chainid].totalVolume += amountIn;
        chainStats[block.chainid].totalTransactions++;
        chainStats[block.chainid].lastUpdated = block.timestamp;
        
        return amountOut;
    }
    
    function postGMOnPlatform() external whenNotPaused registeredUser nonReentrant returns (bytes32) {
        require(address(social) != address(0), "Social protocol not set");
        
        bytes32 postId = social.postGM();
        
        // Update user social reputation (get from social contract)
        (,,,,,,,uint256 reputation,,,) = social.getProfile(msg.sender);
        users[msg.sender].socialReputationScore = reputation;
        
        // Update chain stats
        chainStats[block.chainid].totalTransactions++;
        chainStats[block.chainid].lastUpdated = block.timestamp;
        
        return postId;
    }
    
    // Analytics and Views
    function getPlatformStats() external view returns (
        uint256 totalUsers,
        uint256 totalTokens,
        uint256 totalVolume,
        uint256 totalTransactions,
        uint256 totalChains
    ) {
        totalUsers = allUsers.length;
        totalChains = supportedChains.length;
        
        for (uint256 i = 0; i < supportedChains.length; i++) {
            uint256 chainId = supportedChains[i];
            PlatformStats memory stats = chainStats[chainId];
            totalTokens += stats.totalTokens;
            totalVolume += stats.totalVolume;
            totalTransactions += stats.totalTransactions;
        }
    }
    
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return users[user];
    }
    
    function getChainStats(uint256 chainId) external view returns (PlatformStats memory) {
        return chainStats[chainId];
    }
    
    function getUserActivity(address user) external view returns (CrossChainActivity[] memory) {
        return userActivity[user];
    }
    
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }
    
    function getSupportedChains() external view returns (uint256[] memory) {
        return supportedChains;
    }
    
    function getRecentActivity(uint256 limit) external view returns (CrossChainActivity[] memory) {
        require(limit > 0, "Limit must be positive");
        
        uint256 activityCount = allActivity.length;
        if (activityCount == 0) {
            return new CrossChainActivity[](0);
        }
        
        uint256 returnCount = limit > activityCount ? activityCount : limit;
        CrossChainActivity[] memory recentActivity = new CrossChainActivity[](returnCount);
        
        uint256 startIndex = activityCount > limit ? activityCount - limit : 0;
        for (uint256 i = 0; i < returnCount; i++) {
            recentActivity[i] = allActivity[startIndex + i];
        }
        
        return recentActivity;
    }
    
    // Admin Functions
    function addSupportedChain(
        uint256 chainId,
        string memory chainName
    ) external onlyOwner {
        require(chainStats[chainId].chainId == 0, "Chain already exists");
        
        supportedChains.push(chainId);
        
        chainStats[chainId] = PlatformStats({
            chainId: chainId,
            chainName: chainName,
            totalTokens: 0,
            totalVolume: 0,
            totalUsers: 0,
            totalTransactions: 0,
            isActive: true,
            lastUpdated: block.timestamp
        });
    }
    
    function toggleChainStatus(uint256 chainId) external onlyOwner {
        require(chainStats[chainId].chainId != 0, "Chain does not exist");
        chainStats[chainId].isActive = !chainStats[chainId].isActive;
    }
    
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function setPremiumFee(uint256 _premiumFee) external onlyOwner {
        premiumFee = _premiumFee;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(paused(), "Contract must be paused");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
