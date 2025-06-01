
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SimpleSwap
 * @dev Basic token swap contract for testing
 */
contract SimpleSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 feeRate; // Fee in basis points (100 = 1%)
        bool isActive;
    }
    
    mapping(bytes32 => Pool) public pools;
    mapping(address => mapping(bytes32 => uint256)) public liquidityShares;
    mapping(bytes32 => uint256) public totalShares;
    
    bytes32[] public poolIds;
    
    event PoolCreated(bytes32 indexed poolId, address indexed tokenA, address indexed tokenB);
    event LiquidityAdded(bytes32 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event LiquidityRemoved(bytes32 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event Swap(bytes32 indexed poolId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    
    function createPool(
        address tokenA,
        address tokenB,
        uint256 feeRate
    ) public onlyOwner returns (bytes32) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(feeRate <= 1000, "Fee rate too high"); // Max 10%
        
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pools[poolId].tokenA == address(0), "Pool already exists");
        
        pools[poolId] = Pool({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: 0,
            reserveB: 0,
            feeRate: feeRate,
            isActive: true
        });
        
        poolIds.push(poolId);
        emit PoolCreated(poolId, tokenA, tokenB);
        return poolId;
    }
    
    function addLiquidity(
        bytes32 poolId,
        uint256 amountA,
        uint256 amountB
    ) public nonReentrant returns (uint256 shares) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        
        IERC20(pool.tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        
        if (totalShares[poolId] == 0) {
            shares = sqrt(amountA * amountB);
        } else {
            shares = min(
                (amountA * totalShares[poolId]) / pool.reserveA,
                (amountB * totalShares[poolId]) / pool.reserveB
            );
        }
        
        require(shares > 0, "Insufficient liquidity shares");
        
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        totalShares[poolId] += shares;
        liquidityShares[msg.sender][poolId] += shares;
        
        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, shares);
    }
    
    function removeLiquidity(
        bytes32 poolId,
        uint256 shares
    ) public nonReentrant returns (uint256 amountA, uint256 amountB) {
        Pool storage pool = pools[poolId];
        require(liquidityShares[msg.sender][poolId] >= shares, "Insufficient shares");
        require(totalShares[poolId] > 0, "No liquidity");
        
        amountA = (shares * pool.reserveA) / totalShares[poolId];
        amountB = (shares * pool.reserveB) / totalShares[poolId];
        
        liquidityShares[msg.sender][poolId] -= shares;
        totalShares[poolId] -= shares;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        
        IERC20(pool.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(pool.tokenB).safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, shares);
    }
    
    function swap(
        bytes32 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) public nonReentrant returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");
        
        bool isTokenA = tokenIn == pool.tokenA;
        address tokenOut = isTokenA ? pool.tokenB : pool.tokenA;
        uint256 reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenA ? pool.reserveB : pool.reserveA;
        
        uint256 amountInWithFee = amountIn * (10000 - pool.feeRate) / 10000;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        
        require(amountOut >= minAmountOut, "Insufficient output amount");
        require(amountOut < reserveOut, "Insufficient liquidity");
        
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        
        if (isTokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        emit Swap(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function getAmountOut(
        bytes32 poolId,
        address tokenIn,
        uint256 amountIn
    ) public view returns (uint256 amountOut) {
        Pool memory pool = pools[poolId];
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");
        
        bool isTokenA = tokenIn == pool.tokenA;
        uint256 reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenA ? pool.reserveB : pool.reserveA;
        
        uint256 amountInWithFee = amountIn * (10000 - pool.feeRate) / 10000;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
    }
    
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function getPoolCount() public view returns (uint256) {
        return poolIds.length;
    }
    
    function togglePool(bytes32 poolId) public onlyOwner {
        pools[poolId].isActive = !pools[poolId].isActive;
    }
}
