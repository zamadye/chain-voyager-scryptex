
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GMSocialProtocol is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    struct SocialProfile {
        address user;
        string username;
        string bio;
        string avatarURI;
        uint256 followerCount;
        uint256 followingCount;
        uint256 postCount;
        uint256 reputationScore;
        uint256 joinedAt;
        bool isVerified;
        bool isActive;
    }
    
    struct Post {
        uint256 postId;
        address author;
        string content;
        string mediaURI;
        uint256 timestamp;
        uint256 likeCount;
        uint256 commentCount;
        uint256 shareCount;
        uint256 tipAmount;
        bool isVisible;
        PostType postType;
        uint256 parentPostId; // For comments/replies
    }
    
    struct Comment {
        uint256 commentId;
        uint256 postId;
        address author;
        string content;
        uint256 timestamp;
        uint256 likeCount;
        bool isVisible;
    }
    
    struct ReputationScore {
        address user;
        uint256 totalScore;
        uint256 postScore;
        uint256 interactionScore;
        uint256 communityScore;
        uint256 lastUpdated;
    }
    
    struct Community {
        uint256 communityId;
        string name;
        string description;
        address creator;
        uint256 memberCount;
        uint256 createdAt;
        bool isPrivate;
        bool isActive;
        mapping(address => bool) members;
        mapping(address => bool) moderators;
    }
    
    enum PostType { TEXT, IMAGE, VIDEO, LINK, POLL, GM }
    
    mapping(address => SocialProfile) public profiles;
    mapping(bytes32 => Post) public posts;
    mapping(uint256 => Comment) public comments;
    mapping(address => ReputationScore) public reputation;
    mapping(uint256 => Community) public communities;
    mapping(address => mapping(address => bool)) public following;
    mapping(bytes32 => mapping(address => bool)) public postLikes;
    mapping(uint256 => mapping(address => bool)) public commentLikes;
    mapping(address => uint256[]) public userPosts;
    mapping(address => uint256[]) public userCommunities;
    
    Counters.Counter private _postIdCounter;
    Counters.Counter private _commentIdCounter;
    Counters.Counter private _communityIdCounter;
    
    uint256[] public allCommunities;
    address[] public verifiedUsers;
    
    IERC20 public rewardToken;
    uint256 public constant POST_REWARD = 10 * 1e18; // 10 tokens
    uint256 public constant GM_BONUS = 5 * 1e18; // 5 tokens bonus for GM posts
    uint256 public constant DAILY_GM_LIMIT = 1;
    
    mapping(address => mapping(uint256 => uint256)) public dailyGMCount; // user => day => count
    
    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username, string bio);
    event PostCreated(bytes32 indexed postId, address indexed author, PostType postType);
    event PostLiked(bytes32 indexed postId, address indexed liker);
    event PostCommented(bytes32 indexed postId, uint256 indexed commentId, address indexed commenter);
    event PostTipped(bytes32 indexed postId, address indexed tipper, uint256 amount);
    event UserFollowed(address indexed follower, address indexed followed);
    event CommunityCreated(uint256 indexed communityId, string name, address indexed creator);
    event CommunityJoined(uint256 indexed communityId, address indexed member);
    event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event GMPosted(address indexed user, uint256 timestamp, uint256 reward);
    
    modifier profileExists(address user) {
        require(profiles[user].isActive, "Profile does not exist");
        _;
    }
    
    modifier onlyPostAuthor(bytes32 postId) {
        require(posts[postId].author == msg.sender, "Not post author");
        _;
    }
    
    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
    }
    
    function createProfile(
        string memory username,
        string memory bio,
        string memory avatarURI
    ) external {
        require(!profiles[msg.sender].isActive, "Profile already exists");
        require(bytes(username).length > 0, "Username required");
        
        profiles[msg.sender] = SocialProfile({
            user: msg.sender,
            username: username,
            bio: bio,
            avatarURI: avatarURI,
            followerCount: 0,
            followingCount: 0,
            postCount: 0,
            reputationScore: 100, // Starting reputation
            joinedAt: block.timestamp,
            isVerified: false,
            isActive: true
        });
        
        reputation[msg.sender] = ReputationScore({
            user: msg.sender,
            totalScore: 100,
            postScore: 0,
            interactionScore: 0,
            communityScore: 0,
            lastUpdated: block.timestamp
        });
        
        emit ProfileCreated(msg.sender, username);
    }
    
    function updateProfile(
        string memory username,
        string memory bio,
        string memory avatarURI
    ) external profileExists(msg.sender) {
        SocialProfile storage profile = profiles[msg.sender];
        profile.username = username;
        profile.bio = bio;
        profile.avatarURI = avatarURI;
        
        emit ProfileUpdated(msg.sender, username, bio);
    }
    
    function createPost(
        string memory content,
        string memory mediaURI,
        PostType postType,
        uint256 parentPostId
    ) external profileExists(msg.sender) nonReentrant returns (bytes32) {
        require(bytes(content).length > 0, "Content required");
        
        _postIdCounter.increment();
        uint256 postId = _postIdCounter.current();
        bytes32 postHash = keccak256(abi.encodePacked(msg.sender, postId, block.timestamp));
        
        posts[postHash] = Post({
            postId: postId,
            author: msg.sender,
            content: content,
            mediaURI: mediaURI,
            timestamp: block.timestamp,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
            tipAmount: 0,
            isVisible: true,
            postType: postType,
            parentPostId: parentPostId
        });
        
        // Update user stats
        profiles[msg.sender].postCount++;
        userPosts[msg.sender].push(postId);
        
        // Reward for posting
        uint256 reward = POST_REWARD;
        if (postType == PostType.GM) {
            reward += _handleGMPost(msg.sender);
        }
        
        if (reward > 0 && address(rewardToken) != address(0)) {
            rewardToken.transfer(msg.sender, reward);
        }
        
        // Update reputation
        _updateReputation(msg.sender, 5, "post");
        
        emit PostCreated(postHash, msg.sender, postType);
        
        return postHash;
    }
    
    function postGM() external profileExists(msg.sender) nonReentrant returns (bytes32) {
        uint256 today = block.timestamp / 1 days;
        require(dailyGMCount[msg.sender][today] < DAILY_GM_LIMIT, "Daily GM limit reached");
        
        dailyGMCount[msg.sender][today]++;
        
        string memory gmContent = "GM! Good morning from the blockchain! 🌅";
        bytes32 postHash = createPost(gmContent, "", PostType.GM, 0);
        
        emit GMPosted(msg.sender, block.timestamp, POST_REWARD + GM_BONUS);
        
        return postHash;
    }
    
    function _handleGMPost(address user) internal returns (uint256 bonus) {
        uint256 today = block.timestamp / 1 days;
        if (dailyGMCount[user][today] == 0) {
            bonus = GM_BONUS;
            dailyGMCount[user][today]++;
        }
        return bonus;
    }
    
    function likePost(bytes32 postId) external profileExists(msg.sender) {
        require(posts[postId].isVisible, "Post not visible");
        require(!postLikes[postId][msg.sender], "Already liked");
        
        postLikes[postId][msg.sender] = true;
        posts[postId].likeCount++;
        
        // Reward post author
        address author = posts[postId].author;
        _updateReputation(author, 1, "like_received");
        _updateReputation(msg.sender, 1, "like_given");
        
        emit PostLiked(postId, msg.sender);
    }
    
    function commentOnPost(
        bytes32 postId,
        string memory content
    ) external profileExists(msg.sender) nonReentrant returns (uint256) {
        require(posts[postId].isVisible, "Post not visible");
        require(bytes(content).length > 0, "Content required");
        
        _commentIdCounter.increment();
        uint256 commentId = _commentIdCounter.current();
        
        comments[commentId] = Comment({
            commentId: commentId,
            postId: postId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            likeCount: 0,
            isVisible: true
        });
        
        posts[postId].commentCount++;
        
        // Update reputation
        _updateReputation(msg.sender, 2, "comment");
        
        emit PostCommented(postId, commentId, msg.sender);
        
        return commentId;
    }
    
    function tipPost(bytes32 postId, uint256 amount) external profileExists(msg.sender) nonReentrant {
        require(posts[postId].isVisible, "Post not visible");
        require(amount > 0, "Amount must be positive");
        require(address(rewardToken) != address(0), "Reward token not set");
        
        rewardToken.transferFrom(msg.sender, posts[postId].author, amount);
        posts[postId].tipAmount += amount;
        
        // Update reputation
        _updateReputation(posts[postId].author, amount / 1e18, "tip_received");
        
        emit PostTipped(postId, msg.sender, amount);
    }
    
    function followUser(address userToFollow) external profileExists(msg.sender) profileExists(userToFollow) {
        require(userToFollow != msg.sender, "Cannot follow self");
        require(!following[msg.sender][userToFollow], "Already following");
        
        following[msg.sender][userToFollow] = true;
        profiles[msg.sender].followingCount++;
        profiles[userToFollow].followerCount++;
        
        // Update reputation
        _updateReputation(userToFollow, 3, "follower_gained");
        
        emit UserFollowed(msg.sender, userToFollow);
    }
    
    function unfollowUser(address userToUnfollow) external profileExists(msg.sender) {
        require(following[msg.sender][userToUnfollow], "Not following");
        
        following[msg.sender][userToUnfollow] = false;
        profiles[msg.sender].followingCount--;
        profiles[userToUnfollow].followerCount--;
    }
    
    function createCommunity(
        string memory name,
        string memory description,
        bool isPrivate
    ) external profileExists(msg.sender) returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        
        _communityIdCounter.increment();
        uint256 communityId = _communityIdCounter.current();
        
        Community storage community = communities[communityId];
        community.communityId = communityId;
        community.name = name;
        community.description = description;
        community.creator = msg.sender;
        community.memberCount = 1;
        community.createdAt = block.timestamp;
        community.isPrivate = isPrivate;
        community.isActive = true;
        community.members[msg.sender] = true;
        community.moderators[msg.sender] = true;
        
        allCommunities.push(communityId);
        userCommunities[msg.sender].push(communityId);
        
        // Update reputation
        _updateReputation(msg.sender, 20, "community_created");
        
        emit CommunityCreated(communityId, name, msg.sender);
        
        return communityId;
    }
    
    function joinCommunity(uint256 communityId) external profileExists(msg.sender) {
        Community storage community = communities[communityId];
        require(community.isActive, "Community not active");
        require(!community.members[msg.sender], "Already a member");
        
        community.members[msg.sender] = true;
        community.memberCount++;
        userCommunities[msg.sender].push(communityId);
        
        // Update reputation
        _updateReputation(msg.sender, 5, "community_joined");
        
        emit CommunityJoined(communityId, msg.sender);
    }
    
    function _updateReputation(address user, uint256 points, string memory reason) internal {
        ReputationScore storage rep = reputation[user];
        uint256 oldScore = rep.totalScore;
        
        rep.totalScore += points;
        
        if (keccak256(bytes(reason)) == keccak256(bytes("post"))) {
            rep.postScore += points;
        } else if (keccak256(bytes(reason)) == keccak256(bytes("like_received")) || 
                   keccak256(bytes(reason)) == keccak256(bytes("like_given")) ||
                   keccak256(bytes(reason)) == keccak256(bytes("comment"))) {
            rep.interactionScore += points;
        } else {
            rep.communityScore += points;
        }
        
        rep.lastUpdated = block.timestamp;
        profiles[user].reputationScore = rep.totalScore;
        
        emit ReputationUpdated(user, oldScore, rep.totalScore);
    }
    
    function verifyUser(address user) external onlyOwner {
        require(profiles[user].isActive, "Profile does not exist");
        profiles[user].isVerified = true;
        verifiedUsers.push(user);
    }
    
    function setRewardToken(address _rewardToken) external onlyOwner {
        rewardToken = IERC20(_rewardToken);
    }
    
    function getProfile(address user) external view returns (SocialProfile memory) {
        return profiles[user];
    }
    
    function getPost(bytes32 postId) external view returns (Post memory) {
        return posts[postId];
    }
    
    function getComment(uint256 commentId) external view returns (Comment memory) {
        return comments[commentId];
    }
    
    function getUserPosts(address user) external view returns (uint256[] memory) {
        return userPosts[user];
    }
    
    function getUserCommunities(address user) external view returns (uint256[] memory) {
        return userCommunities[user];
    }
    
    function isFollowing(address follower, address followed) external view returns (bool) {
        return following[follower][followed];
    }
    
    function hasLikedPost(address user, bytes32 postId) external view returns (bool) {
        return postLikes[postId][user];
    }
    
    function getAllCommunities() external view returns (uint256[] memory) {
        return allCommunities;
    }
    
    function getVerifiedUsers() external view returns (address[] memory) {
        return verifiedUsers;
    }
    
    function isCommunityMember(uint256 communityId, address user) external view returns (bool) {
        return communities[communityId].members[user];
    }
    
    function getDailyGMCount(address user) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        return dailyGMCount[user][today];
    }
}
