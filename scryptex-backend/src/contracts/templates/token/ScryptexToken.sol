
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ScryptexToken
 * @dev Advanced ERC20 token with additional features
 */
contract ScryptexToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public mintingFee = 0.001 ether;
    bool public mintingEnabled = true;
    
    mapping(address => bool) public minters;
    mapping(address => uint256) public lastMintTime;
    
    event MintingFeeChanged(uint256 oldFee, uint256 newFee);
    event MintingToggled(bool enabled);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    modifier mintingAllowed() {
        require(mintingEnabled, "Minting is disabled");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
    }
    
    function mint(address to, uint256 amount) public payable onlyMinter mintingAllowed {
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        require(block.timestamp >= lastMintTime[msg.sender] + 1 hours, "Minting cooldown active");
        
        lastMintTime[msg.sender] = block.timestamp;
        _mint(to, amount);
    }
    
    function addMinter(address minter) public onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) public onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    function setMintingFee(uint256 newFee) public onlyOwner {
        uint256 oldFee = mintingFee;
        mintingFee = newFee;
        emit MintingFeeChanged(oldFee, newFee);
    }
    
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    function withdrawFees() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function airdrop(address[] memory recipients, uint256 amount) public onlyOwner {
        require(totalSupply() + (recipients.length * amount) <= MAX_SUPPLY, "Airdrop would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amount);
        }
    }
}
