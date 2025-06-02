
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ScryptexBridge is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    
    struct ChainConfig {
        uint256 chainId;
        bool isActive;
        uint256 minConfirmations;
        uint256 maxTransferAmount;
        uint256 dailyLimit;
        uint256 dailyTransferred;
        uint256 lastResetTime;
        string rpcUrl;
        address bridgeContract;
    }
    
    struct ValidatorSet {
        address[] validators;
        uint256 threshold;
        uint256 nonce;
    }
    
    struct Transfer {
        uint256 transferId;
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 sourceChain;
        uint256 targetChain;
        uint256 timestamp;
        bool processed;
        bytes32 txHash;
    }
    
    struct BridgeMessage {
        uint256 messageId;
        uint256 sourceChain;
        uint256 targetChain;
        address sender;
        bytes data;
        uint256 timestamp;
        bool executed;
    }
    
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(uint256 => ValidatorSet) public validatorSets;
    mapping(bytes32 => Transfer) public transfers;
    mapping(bytes32 => BridgeMessage) public messages;
    mapping(address => mapping(uint256 => uint256)) public userNonces;
    mapping(bytes32 => bool) public processedTxs;
    
    uint256 public transferCounter;
    uint256 public messageCounter;
    uint256 public constant MIN_VALIDATORS = 3;
    uint256 public constant MAX_VALIDATORS = 21;
    
    event TransferInitiated(
        bytes32 indexed transferId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 sourceChain,
        uint256 targetChain
    );
    
    event TransferCompleted(
        bytes32 indexed transferId,
        address indexed recipient,
        address token,
        uint256 amount
    );
    
    event MessageSent(
        uint256 indexed messageId,
        uint256 sourceChain,
        uint256 targetChain,
        address sender,
        bytes data
    );
    
    event MessageExecuted(
        uint256 indexed messageId,
        uint256 sourceChain,
        bool success
    );
    
    event ValidatorSetUpdated(uint256 indexed chainId, address[] validators, uint256 threshold);
    event ChainConfigUpdated(uint256 indexed chainId, bool isActive);
    
    modifier onlyValidChain(uint256 chainId) {
        require(chainConfigs[chainId].isActive, "Chain not supported");
        _;
    }
    
    modifier onlyValidator(uint256 chainId) {
        require(hasRole(VALIDATOR_ROLE, msg.sender), "Not a validator");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }
    
    function initializeChain(
        uint256 chainId,
        uint256 minConfirmations,
        uint256 maxTransferAmount,
        uint256 dailyLimit,
        string memory rpcUrl,
        address bridgeContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        chainConfigs[chainId] = ChainConfig({
            chainId: chainId,
            isActive: true,
            minConfirmations: minConfirmations,
            maxTransferAmount: maxTransferAmount,
            dailyLimit: dailyLimit,
            dailyTransferred: 0,
            lastResetTime: block.timestamp,
            rpcUrl: rpcUrl,
            bridgeContract: bridgeContract
        });
        
        emit ChainConfigUpdated(chainId, true);
    }
    
    function setValidatorSet(
        uint256 chainId,
        address[] memory validators,
        uint256 threshold
    ) external onlyRole(DEFAULT_ADMIN_ROLE) onlyValidChain(chainId) {
        require(validators.length >= MIN_VALIDATORS, "Not enough validators");
        require(validators.length <= MAX_VALIDATORS, "Too many validators");
        require(threshold > validators.length / 2, "Threshold too low");
        require(threshold <= validators.length, "Threshold too high");
        
        validatorSets[chainId] = ValidatorSet({
            validators: validators,
            threshold: threshold,
            nonce: validatorSets[chainId].nonce + 1
        });
        
        // Grant validator role to new validators
        for (uint256 i = 0; i < validators.length; i++) {
            _grantRole(VALIDATOR_ROLE, validators[i]);
        }
        
        emit ValidatorSetUpdated(chainId, validators, threshold);
    }
    
    function initiateTransfer(
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChain
    ) external payable whenNotPaused nonReentrant onlyValidChain(targetChain) returns (bytes32) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        ChainConfig storage config = chainConfigs[targetChain];
        require(amount <= config.maxTransferAmount, "Amount exceeds limit");
        
        // Check daily limit
        if (block.timestamp > config.lastResetTime + 1 days) {
            config.dailyTransferred = 0;
            config.lastResetTime = block.timestamp;
        }
        require(config.dailyTransferred + amount <= config.dailyLimit, "Daily limit exceeded");
        config.dailyTransferred += amount;
        
        bytes32 transferId = keccak256(abi.encodePacked(
            block.chainid,
            targetChain,
            msg.sender,
            recipient,
            token,
            amount,
            userNonces[msg.sender][targetChain]++,
            block.timestamp
        ));
        
        // Lock tokens or ETH
        if (token == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            require(msg.value == 0, "ETH not needed for token transfer");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }
        
        transfers[transferId] = Transfer({
            transferId: transferCounter++,
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            sourceChain: block.chainid,
            targetChain: targetChain,
            timestamp: block.timestamp,
            processed: false,
            txHash: bytes32(0)
        });
        
        emit TransferInitiated(transferId, msg.sender, recipient, token, amount, block.chainid, targetChain);
        
        return transferId;
    }
    
    function completeTransfer(
        bytes32 transferId,
        bytes[] memory signatures
    ) external whenNotPaused nonReentrant onlyValidator(block.chainid) {
        Transfer storage transfer = transfers[transferId];
        require(!transfer.processed, "Transfer already processed");
        require(transfer.targetChain == block.chainid, "Wrong target chain");
        
        // Verify signatures
        require(_verifySignatures(transferId, signatures, transfer.sourceChain), "Invalid signatures");
        
        transfer.processed = true;
        
        // Release tokens or ETH
        if (transfer.token == address(0)) {
            (bool success, ) = transfer.recipient.call{value: transfer.amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(transfer.token).safeTransfer(transfer.recipient, transfer.amount);
        }
        
        emit TransferCompleted(transferId, transfer.recipient, transfer.token, transfer.amount);
    }
    
    function sendMessage(
        uint256 targetChain,
        bytes memory data
    ) external payable whenNotPaused returns (uint256) {
        require(chainConfigs[targetChain].isActive, "Target chain not supported");
        
        uint256 messageId = messageCounter++;
        
        messages[keccak256(abi.encodePacked(messageId))] = BridgeMessage({
            messageId: messageId,
            sourceChain: block.chainid,
            targetChain: targetChain,
            sender: msg.sender,
            data: data,
            timestamp: block.timestamp,
            executed: false
        });
        
        emit MessageSent(messageId, block.chainid, targetChain, msg.sender, data);
        
        return messageId;
    }
    
    function executeMessage(
        uint256 messageId,
        address target,
        bytes memory data,
        bytes[] memory signatures
    ) external whenNotPaused nonReentrant onlyRole(RELAYER_ROLE) {
        bytes32 messageHash = keccak256(abi.encodePacked(messageId));
        BridgeMessage storage message = messages[messageHash];
        
        require(!message.executed, "Message already executed");
        require(message.targetChain == block.chainid, "Wrong target chain");
        
        // Verify signatures
        require(_verifySignatures(messageHash, signatures, message.sourceChain), "Invalid signatures");
        
        message.executed = true;
        
        // Execute the message
        (bool success, ) = target.call(data);
        
        emit MessageExecuted(messageId, message.sourceChain, success);
    }
    
    function _verifySignatures(
        bytes32 hash,
        bytes[] memory signatures,
        uint256 sourceChain
    ) internal view returns (bool) {
        ValidatorSet memory validatorSet = validatorSets[sourceChain];
        require(signatures.length >= validatorSet.threshold, "Not enough signatures");
        
        bytes32 messageHash = hash.toEthSignedMessageHash();
        address[] memory signers = new address[](signatures.length);
        
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = messageHash.recover(signatures[i]);
            
            // Check if signer is a validator
            bool isValidator = false;
            for (uint256 j = 0; j < validatorSet.validators.length; j++) {
                if (validatorSet.validators[j] == signer) {
                    isValidator = true;
                    break;
                }
            }
            require(isValidator, "Invalid validator signature");
            
            // Check for duplicate signers
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signer, "Duplicate signature");
            }
            signers[i] = signer;
        }
        
        return true;
    }
    
    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(paused(), "Contract must be paused");
        
        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }
    
    function getValidators(uint256 chainId) external view returns (address[] memory) {
        return validatorSets[chainId].validators;
    }
    
    function getTransfer(bytes32 transferId) external view returns (Transfer memory) {
        return transfers[transferId];
    }
    
    function getMessage(bytes32 messageHash) external view returns (BridgeMessage memory) {
        return messages[messageHash];
    }
}
