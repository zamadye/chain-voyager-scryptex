
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

library BondingCurveMath {
    uint256 constant PRECISION = 1e18;
    
    // Linear: price = slope * totalSupply + intercept
    function linearCurve(uint256 supply, uint256 slope, uint256 intercept) 
        external pure returns (uint256) {
        return (slope * supply) / PRECISION + intercept;
    }
    
    // Exponential: price = base^(supply/divisor) * multiplier  
    function exponentialCurve(uint256 supply, uint256 base, uint256 divisor, uint256 multiplier)
        external pure returns (uint256) {
        if (supply == 0) return multiplier;
        uint256 exponent = (supply * PRECISION) / divisor;
        return multiplier * _pow(base, exponent) / PRECISION;
    }
    
    // Logarithmic: price = log(supply + offset) * multiplier
    function logarithmicCurve(uint256 supply, uint256 offset, uint256 multiplier)
        external pure returns (uint256) {
        return multiplier * _log(supply + offset) / PRECISION;
    }
    
    // Sigmoid: price = maxPrice / (1 + e^(-steepness * (supply - midpoint)))
    function sigmoidCurve(uint256 supply, uint256 maxPrice, uint256 steepness, uint256 midpoint)
        external pure returns (uint256) {
        int256 x = int256(supply) - int256(midpoint);
        int256 exp_term = -int256(steepness) * x / int256(PRECISION);
        uint256 denominator = PRECISION + _exp(exp_term);
        return (maxPrice * PRECISION) / denominator;
    }
    
    function _pow(uint256 base, uint256 exponent) internal pure returns (uint256) {
        if (exponent == 0) return PRECISION;
        uint256 result = PRECISION;
        while (exponent > 0) {
            if (exponent & 1 == 1) {
                result = (result * base) / PRECISION;
            }
            base = (base * base) / PRECISION;
            exponent >>= 1;
        }
        return result;
    }
    
    function _log(uint256 x) internal pure returns (uint256) {
        require(x > 0, "log(0) undefined");
        uint256 result = 0;
        while (x >= 2 * PRECISION) {
            result += PRECISION;
            x /= 2;
        }
        return result;
    }
    
    function _exp(int256 x) internal pure returns (uint256) {
        if (x < 0) return PRECISION / _exp(-x);
        if (x == 0) return PRECISION;
        uint256 result = PRECISION;
        uint256 term = PRECISION;
        for (uint256 i = 1; i <= 10; i++) {
            term = (term * uint256(x)) / (i * PRECISION);
            result += term;
        }
        return result;
    }
}

contract BondingCurveToken is ERC20, ReentrancyGuard {
    using BondingCurveMath for uint256;
    
    enum CurveType { LINEAR, EXPONENTIAL, LOGARITHMIC, SIGMOID }
    
    struct CurveConfig {
        CurveType curveType;
        uint256 param1; // slope/base/offset/maxPrice
        uint256 param2; // intercept/divisor/multiplier/steepness
        uint256 param3; // multiplier/midpoint
    }
    
    CurveConfig public curveConfig;
    uint256 public reserveBalance;
    uint256 public graduationThreshold;
    bool public graduated;
    address public factory;
    address public creator;
    
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1B tokens
    uint256 public constant GRADUATION_SUPPLY = 800_000_000 * 1e18; // 800M tokens
    
    event TokensPurchased(address indexed buyer, uint256 tokensReceived, uint256 ethSpent, uint256 newPrice);
    event TokensSold(address indexed seller, uint256 tokensSold, uint256 ethReceived, uint256 newPrice);
    event Graduated(uint256 liquidityAmount, address dexPair);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        address _creator,
        CurveConfig memory _curveConfig
    ) ERC20(name, symbol) {
        factory = msg.sender;
        creator = _creator;
        curveConfig = _curveConfig;
        graduationThreshold = GRADUATION_SUPPLY;
    }
    
    function getCurrentPrice() public view returns (uint256) {
        return _calculatePrice(totalSupply());
    }
    
    function _calculatePrice(uint256 supply) internal view returns (uint256) {
        if (curveConfig.curveType == CurveType.LINEAR) {
            return BondingCurveMath.linearCurve(supply, curveConfig.param1, curveConfig.param2);
        } else if (curveConfig.curveType == CurveType.EXPONENTIAL) {
            return BondingCurveMath.exponentialCurve(supply, curveConfig.param1, curveConfig.param2, curveConfig.param3);
        } else if (curveConfig.curveType == CurveType.LOGARITHMIC) {
            return BondingCurveMath.logarithmicCurve(supply, curveConfig.param1, curveConfig.param2);
        } else if (curveConfig.curveType == CurveType.SIGMOID) {
            return BondingCurveMath.sigmoidCurve(supply, curveConfig.param1, curveConfig.param2, curveConfig.param3);
        }
        return 0;
    }
    
    function buyTokens(uint256 minTokensOut) external payable nonReentrant {
        require(msg.value > 0, "ETH required");
        require(!graduated, "Token has graduated");
        
        uint256 tokensToMint = _calculateTokensFromETH(msg.value);
        require(tokensToMint >= minTokensOut, "Slippage exceeded");
        require(totalSupply() + tokensToMint <= MAX_SUPPLY, "Max supply exceeded");
        
        reserveBalance += msg.value;
        _mint(msg.sender, tokensToMint);
        
        emit TokensPurchased(msg.sender, tokensToMint, msg.value, getCurrentPrice());
        
        if (totalSupply() >= graduationThreshold) {
            _graduate();
        }
    }
    
    function sellTokens(uint256 tokenAmount, uint256 minETHOut) external nonReentrant {
        require(tokenAmount > 0, "Token amount required");
        require(!graduated, "Token has graduated");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        uint256 ethToReturn = _calculateETHFromTokens(tokenAmount);
        require(ethToReturn >= minETHOut, "Slippage exceeded");
        require(ethToReturn <= reserveBalance, "Insufficient reserves");
        
        _burn(msg.sender, tokenAmount);
        reserveBalance -= ethToReturn;
        
        (bool success, ) = msg.sender.call{value: ethToReturn}("");
        require(success, "ETH transfer failed");
        
        emit TokensSold(msg.sender, tokenAmount, ethToReturn, getCurrentPrice());
    }
    
    function _calculateTokensFromETH(uint256 ethAmount) internal view returns (uint256) {
        // Simplified calculation - in production, use integration of price curve
        uint256 currentPrice = getCurrentPrice();
        return (ethAmount * 1e18) / currentPrice;
    }
    
    function _calculateETHFromTokens(uint256 tokenAmount) internal view returns (uint256) {
        // Simplified calculation - in production, use integration of price curve
        uint256 currentPrice = getCurrentPrice();
        return (tokenAmount * currentPrice) / 1e18;
    }
    
    function _graduate() internal {
        graduated = true;
        // Send liquidity to DEX
        emit Graduated(reserveBalance, address(0)); // DEX pair address would be set here
    }
}

contract BondingCurveFactory is Ownable, Pausable, ReentrancyGuard {
    using BondingCurveMath for uint256;
    
    struct TokenInfo {
        address tokenAddress;
        address creator;
        uint256 createdAt;
        bool active;
    }
    
    mapping(address => TokenInfo) public tokens;
    mapping(address => address[]) public creatorTokens;
    address[] public allTokens;
    
    uint256 public creationFee = 0.01 ether;
    uint256 public platformFeePercent = 100; // 1%
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        BondingCurveToken.CurveType curveType
    );
    
    function createToken(
        string memory name,
        string memory symbol,
        BondingCurveToken.CurveType curveType,
        uint256 param1,
        uint256 param2,
        uint256 param3
    ) external payable whenNotPaused nonReentrant returns (address) {
        require(msg.value >= creationFee, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        
        BondingCurveToken.CurveConfig memory config = BondingCurveToken.CurveConfig({
            curveType: curveType,
            param1: param1,
            param2: param2,
            param3: param3
        });
        
        BondingCurveToken token = new BondingCurveToken(name, symbol, msg.sender, config);
        address tokenAddress = address(token);
        
        tokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        });
        
        creatorTokens[msg.sender].push(tokenAddress);
        allTokens.push(tokenAddress);
        
        emit TokenCreated(tokenAddress, msg.sender, name, symbol, curveType);
        
        return tokenAddress;
    }
    
    function getCreatorTokens(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }
    
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
    
    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
    }
    
    function setPlatformFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
