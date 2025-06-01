// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GMRitual
 * @dev Community GM posting and ritual tracking contract
 */
contract GMRitual is Ownable {
    struct GMPost {
        address poster;
        string message;
        uint256 timestamp;
        uint256 likes;
        bool isSpecial;
    }
    
    struct User {
        uint256 totalGMs;
        uint256 streak;
        uint256 lastGMTimestamp;
        uint256 totalLikes;
        bool isActive;
        string username;
    }
    
    mapping(address => User) public users;
    mapping(uint256 => GMPost) public gmPosts;
    mapping(uint256 => mapping(address => bool)) public postLikes;
    mapping(address => uint256[]) public userPosts;
    
    uint256 public totalPosts;
    uint256 public totalUsers;
    uint256 public dailyGMReward = 0.001 ether;
    uint256 public streakBonus = 0.0005 ether;
    uint256 public constant SECONDS_IN_DAY = 86400;
    
    address[] public activeUsers;
    uint256[] public recentPosts;
    
    event GMPosted(uint256 indexed postId, address indexed poster, string message, bool isSpecial);
    event PostLiked(uint256 indexed postId, address indexed liker);
    event StreakUpdated(address indexed user, uint256 newStreak);
    event RewardClaimed(address indexed user, uint256 amount);
    event UsernameSet(address indexed user, string username);
    
    constructor() Ownable(msg.sender) {}
    
    function postGM(string memory message) public payable {
        require(bytes(message).length > 0, "Message cannot be empty");
        require(bytes(message).length <= 280, "Message too long");
        
        User storage user = users[msg.sender];
        
        // Initialize new user
        if (!user.isActive) {
            user.isActive = true;
            totalUsers++;
            activeUsers.push(msg.sender);
        }
        
        // Check if it's a new day for streak calculation
        bool isNewDay = block.timestamp >= user.lastGMTimestamp + SECONDS_IN_DAY;
        bool isWithinGracePeriod = block.timestamp <= user.lastGMTimestamp + (SECONDS_IN_DAY * 2);
        
        if (isNewDay) {
            if (isWithinGracePeriod && user.lastGMTimestamp > 0) {
                user.streak++;
            } else {
                user.streak = 1;
            }
            emit StreakUpdated(msg.sender, user.streak);
        }
        
        // Determine if this is a special GM (first of the day, milestone, etc.)
        bool isSpecial = isNewDay || user.totalGMs % 100 == 0 || user.streak % 7 == 0;
        
        // Create GM post
        uint256 postId = totalPosts++;
        gmPosts[postId] = GMPost({
            poster: msg.sender,
            message: message,
            timestamp: block.timestamp,
            likes: 0,
            isSpecial: isSpecial
        });
        
        // Update user stats
        user.totalGMs++;
        user.lastGMTimestamp = block.timestamp;
        userPosts[msg.sender].push(postId);
        recentPosts.push(postId);
        
        // Keep only last 100 recent posts
        if (recentPosts.length > 100) {
            for (uint256 i = 0; i < recentPosts.length - 1; i++) {
                recentPosts[i] = recentPosts[i + 1];
            }
            recentPosts.pop();
        }
        
        emit GMPosted(postId, msg.sender, message, isSpecial);
        
        // Auto-claim daily reward if eligible
        if (isNewDay) {
            _claimDailyReward();
        }
    }
    
    function likePost(uint256 postId) public {
        require(postId < totalPosts, "Post does not exist");
        require(!postLikes[postId][msg.sender], "Already liked");
        require(gmPosts[postId].poster != msg.sender, "Cannot like own post");
        
        postLikes[postId][msg.sender] = true;
        gmPosts[postId].likes++;
        users[gmPosts[postId].poster].totalLikes++;
        
        emit PostLiked(postId, msg.sender);
    }
    
    function setUsername(string memory username) public {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 32, "Username too long");
        
        users[msg.sender].username = username;
        emit UsernameSet(msg.sender, username);
    }
    
    function claimDailyReward() public {
        _claimDailyReward();
    }
    
    function _claimDailyReward() internal {
        User storage user = users[msg.sender];
        require(user.isActive, "User not active");
        require(user.lastGMTimestamp >= block.timestamp - SECONDS_IN_DAY, "No GM today");
        
        uint256 reward = dailyGMReward;
        if (user.streak >= 7) {
            reward += streakBonus * (user.streak / 7);
        }
        
        require(address(this).balance >= reward, "Insufficient contract balance");
        
        payable(msg.sender).transfer(reward);
        emit RewardClaimed(msg.sender, reward);
    }
    
    function getRecentPosts(uint256 count) public view returns (uint256[] memory) {
        uint256 length = recentPosts.length;
        uint256 returnCount = count > length ? length : count;
        uint256[] memory result = new uint256[](returnCount);
        
        for (uint256 i = 0; i < returnCount; i++) {
            result[i] = recentPosts[length - 1 - i];
        }
        
        return result;
    }
    
    function getUserPosts(address user, uint256 offset, uint256 limit) public view returns (uint256[] memory) {
        uint256[] memory posts = userPosts[user];
        uint256 length = posts.length;
        
        if (offset >= length) {
            return new uint256[](0);
        }
        
        uint256 end = offset + limit;
        if (end > length) {
            end = length;
        }
        
        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = posts[length - 1 - i]; // Reverse order (newest first)
        }
        
        return result;
    }
    
    function getTopUsers(uint256 count) public view returns (address[] memory) {
        // Simple implementation - in production, this should be optimized
        address[] memory result = new address[](count > activeUsers.length ? activeUsers.length : count);
        // This is a simplified version - full implementation would sort by GM count
        for (uint256 i = 0; i < result.length; i++) {
            result[i] = activeUsers[i];
        }
        return result;
    }
    
    function fundContract() public payable onlyOwner {
        // Function to add funds for rewards
    }
    
    function withdrawFunds(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    function setDailyReward(uint256 newReward) public onlyOwner {
        dailyGMReward = newReward;
    }
    
    function setStreakBonus(uint256 newBonus) public onlyOwner {
        streakBonus = newBonus;
    }
    
    function getContractStats() public view returns (
        uint256 _totalPosts,
        uint256 _totalUsers,
        uint256 _contractBalance,
        uint256 _dailyReward
    ) {
        return (totalPosts, totalUsers, address(this).balance, dailyGMReward);
    }
    
    receive() external payable {}
}
