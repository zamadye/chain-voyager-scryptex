
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ScryptexNFT
 * @dev Advanced NFT contract with metadata and royalties
 */
contract ScryptexNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxMintsPerWallet = 5;
    bool public publicMintEnabled = false;
    string public baseTokenURI;
    
    mapping(address => uint256) public mintsPerWallet;
    mapping(uint256 => address) public tokenCreators;
    
    event MintPriceChanged(uint256 oldPrice, uint256 newPrice);
    event PublicMintToggled(bool enabled);
    event BaseURIChanged(string oldURI, string newURI);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory _baseTokenURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        baseTokenURI = _baseTokenURI;
    }
    
    function mint(address to, string memory uri) public payable {
        require(publicMintEnabled || msg.sender == owner(), "Public minting not enabled");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(mintsPerWallet[to] < maxMintsPerWallet, "Max mints per wallet reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        mintsPerWallet[to]++;
        tokenCreators[tokenId] = msg.sender;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    
    function batchMint(address[] memory recipients, string[] memory uris) public onlyOwner {
        require(recipients.length == uris.length, "Arrays length mismatch");
        require(_tokenIdCounter.current() + recipients.length <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            tokenCreators[tokenId] = msg.sender;
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, uris[i]);
        }
    }
    
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceChanged(oldPrice, newPrice);
    }
    
    function togglePublicMint() public onlyOwner {
        publicMintEnabled = !publicMintEnabled;
        emit PublicMintToggled(publicMintEnabled);
    }
    
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        string memory oldURI = baseTokenURI;
        baseTokenURI = newBaseURI;
        emit BaseURIChanged(oldURI, newBaseURI);
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
