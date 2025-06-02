
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ScryptexDEX is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        uint256 feePercent; // Fee in basis points (100 = 1%)
        uint256 lastUpdateTime;
        bool isActive;
    }
    
    struct OrderBook {
        mapping(uint256 => Order) buyOrders;
        mapping(uint256 => Order) sellOrders;
        uint256[] buyOrderIds;
        uint256[] sellOrderIds;
        uint256 nextOrderId;
    }
    
    struct Order {
        uint256 orderId;
        address trader;
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 price;
        uint256 filled;
        uint256 timestamp;
        bool isActive;
        OrderType orderType;
    }
    
    enum OrderType { MARKET, LIMIT, STOP_LOSS, TAKE_PROFIT }
    
    struct UserPosition {
        address user;
        address tokenA;
        address tokenB;
        uint256 liquidityShares;
        uint256 depositedA;
        uint256 depositedB;
        uint256 rewardsEarned;
    }
    
    mapping(bytes32 => Pool) public pools;
    mapping(bytes32 => OrderBook) public orderBooks;
    mapping(address => mapping(bytes32 => UserPosition)) public positions;
    mapping(address => uint256[]) public userOrders;
    
    bytes32[] public poolList;
    uint256 public orderCounter;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 public constant MAX_FEE = 3000; // 30%
    uint256 public protocolFeePercent = 500; // 5%
    
    event PoolCreated(
        bytes32 indexed poolId,
        address indexed tokenA,
        address indexed tokenB,
        uint256 feePercent
    );
    
    event LiquidityAdded(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event Swap(
        bytes32 indexed poolId,
        address indexed trader,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event OrderPlaced(
        uint256 indexed orderId,
        address indexed trader,
        bytes32 indexed poolId,
        OrderType orderType,
        uint256 amountA,
        uint256 price
    );
    
    event OrderFilled(
        uint256 indexed orderId,
        address indexed trader,
        uint256 amountFilled,
        uint256 executionPrice
    );
    
    event OrderCancelled(uint256 indexed orderId, address indexed trader);
    
    function createPool(
        address tokenA,
        address tokenB,
        uint256 feePercent
    ) external whenNotPaused returns (bytes32) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(feePercent <= MAX_FEE, "Fee too high");
        
        if (tokenA > tokenB) {
            (tokenA, tokenB) = (tokenB, tokenA);
        }
        
        bytes32 poolId = keccak256(abi.encodePacked(tokenA, tokenB));
        require(pools[poolId].tokenA == address(0), "Pool exists");
        
        pools[poolId] = Pool({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: 0,
            reserveB: 0,
            totalLiquidity: 0,
            feePercent: feePercent,
            lastUpdateTime: block.timestamp,
            isActive: true
        });
        
        poolList.push(poolId);
        
        emit PoolCreated(poolId, tokenA, tokenB, feePercent);
        
        return poolId;
    }
    
    function addLiquidity(
        bytes32 poolId,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external whenNotPaused nonReentrant returns (uint256 liquidity) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        
        uint256 amountA;
        uint256 amountB;
        
        if (pool.totalLiquidity == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
            liquidity = _sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            pool.totalLiquidity = MINIMUM_LIQUIDITY; // Lock minimum liquidity
        } else {
            uint256 amountBOptimal = quote(amountADesired, pool.reserveA, pool.reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint256 amountAOptimal = quote(amountBDesired, pool.reserveB, pool.reserveA);
                require(amountAOptimal <= amountADesired && amountAOptimal >= amountAMin, "Insufficient A amount");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
            
            liquidity = _min(
                (amountA * pool.totalLiquidity) / pool.reserveA,
                (amountB * pool.totalLiquidity) / pool.reserveB
            );
        }
        
        require(liquidity > 0, "Insufficient liquidity minted");
        
        // Transfer tokens
        IERC20(pool.tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        
        // Update pool reserves
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalLiquidity += liquidity;
        pool.lastUpdateTime = block.timestamp;
        
        // Update user position
        UserPosition storage position = positions[msg.sender][poolId];
        position.user = msg.sender;
        position.tokenA = pool.tokenA;
        position.tokenB = pool.tokenB;
        position.liquidityShares += liquidity;
        position.depositedA += amountA;
        position.depositedB += amountB;
        
        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity);
    }
    
    function removeLiquidity(
        bytes32 poolId,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        Pool storage pool = pools[poolId];
        UserPosition storage position = positions[msg.sender][poolId];
        
        require(position.liquidityShares >= liquidity, "Insufficient liquidity");
        require(liquidity > 0, "Invalid liquidity amount");
        
        amountA = (liquidity * pool.reserveA) / pool.totalLiquidity;
        amountB = (liquidity * pool.reserveB) / pool.totalLiquidity;
        
        require(amountA >= amountAMin && amountB >= amountBMin, "Insufficient output amounts");
        
        // Update pool reserves
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalLiquidity -= liquidity;
        pool.lastUpdateTime = block.timestamp;
        
        // Update user position
        position.liquidityShares -= liquidity;
        position.depositedA = (position.depositedA * position.liquidityShares) / (position.liquidityShares + liquidity);
        position.depositedB = (position.depositedB * position.liquidityShares) / (position.liquidityShares + liquidity);
        
        // Transfer tokens
        IERC20(pool.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(pool.tokenB).safeTransfer(msg.sender, amountB);
        
        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }
    
    function swapExactTokensForTokens(
        bytes32 poolId,
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut
    ) external whenNotPaused nonReentrant returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid input token");
        require(tokenOut == pool.tokenA || tokenOut == pool.tokenB, "Invalid output token");
        require(tokenIn != tokenOut, "Identical tokens");
        
        bool isTokenAIn = tokenIn == pool.tokenA;
        uint256 reserveIn = isTokenAIn ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = isTokenAIn ? pool.reserveB : pool.reserveA;
        
        amountOut = getAmountOut(amountIn, reserveIn, reserveOut, pool.feePercent);
        require(amountOut >= amountOutMin, "Insufficient output amount");
        
        // Transfer tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        
        // Update reserves
        if (isTokenAIn) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        pool.lastUpdateTime = block.timestamp;
        
        emit Swap(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function placeLimitOrder(
        bytes32 poolId,
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 price,
        bool isBuyOrder
    ) external whenNotPaused nonReentrant returns (uint256 orderId) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "Pool not active");
        
        orderId = orderCounter++;
        
        Order memory newOrder = Order({
            orderId: orderId,
            trader: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            amountA: amountA,
            amountB: (amountA * price) / 1e18,
            price: price,
            filled: 0,
            timestamp: block.timestamp,
            isActive: true,
            orderType: OrderType.LIMIT
        });
        
        OrderBook storage orderBook = orderBooks[poolId];
        
        if (isBuyOrder) {
            orderBook.buyOrders[orderId] = newOrder;
            orderBook.buyOrderIds.push(orderId);
        } else {
            orderBook.sellOrders[orderId] = newOrder;
            orderBook.sellOrderIds.push(orderId);
        }
        
        userOrders[msg.sender].push(orderId);
        
        // Lock tokens
        if (isBuyOrder) {
            IERC20(tokenB).safeTransferFrom(msg.sender, address(this), newOrder.amountB);
        } else {
            IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        }
        
        emit OrderPlaced(orderId, msg.sender, poolId, OrderType.LIMIT, amountA, price);
        
        // Try to match order immediately
        _matchOrders(poolId, orderId, isBuyOrder);
    }
    
    function cancelOrder(bytes32 poolId, uint256 orderId, bool isBuyOrder) external nonReentrant {
        OrderBook storage orderBook = orderBooks[poolId];
        Order storage order = isBuyOrder ? orderBook.buyOrders[orderId] : orderBook.sellOrders[orderId];
        
        require(order.trader == msg.sender, "Not order owner");
        require(order.isActive, "Order not active");
        
        order.isActive = false;
        
        // Refund locked tokens
        uint256 unfilledAmount = order.amountA - order.filled;
        if (isBuyOrder) {
            uint256 refundAmount = (unfilledAmount * order.price) / 1e18;
            IERC20(order.tokenB).safeTransfer(msg.sender, refundAmount);
        } else {
            IERC20(order.tokenA).safeTransfer(msg.sender, unfilledAmount);
        }
        
        emit OrderCancelled(orderId, msg.sender);
    }
    
    function _matchOrders(bytes32 poolId, uint256 newOrderId, bool isNewOrderBuy) internal {
        OrderBook storage orderBook = orderBooks[poolId];
        Order storage newOrder = isNewOrderBuy ? orderBook.buyOrders[newOrderId] : orderBook.sellOrders[newOrderId];
        
        uint256[] storage oppositeOrderIds = isNewOrderBuy ? orderBook.sellOrderIds : orderBook.buyOrderIds;
        
        for (uint256 i = 0; i < oppositeOrderIds.length && newOrder.filled < newOrder.amountA; i++) {
            uint256 oppositeOrderId = oppositeOrderIds[i];
            Order storage oppositeOrder = isNewOrderBuy ? orderBook.sellOrders[oppositeOrderId] : orderBook.buyOrders[oppositeOrderId];
            
            if (!oppositeOrder.isActive || oppositeOrder.filled >= oppositeOrder.amountA) continue;
            
            // Check price compatibility
            bool canMatch = isNewOrderBuy ? newOrder.price >= oppositeOrder.price : newOrder.price <= oppositeOrder.price;
            if (!canMatch) continue;
            
            // Calculate match amount
            uint256 availableNew = newOrder.amountA - newOrder.filled;
            uint256 availableOpposite = oppositeOrder.amountA - oppositeOrder.filled;
            uint256 matchAmount = _min(availableNew, availableOpposite);
            
            if (matchAmount > 0) {
                // Execute trade
                uint256 executionPrice = oppositeOrder.price; // Price taker gets maker's price
                uint256 tradeValueB = (matchAmount * executionPrice) / 1e18;
                
                // Update orders
                newOrder.filled += matchAmount;
                oppositeOrder.filled += matchAmount;
                
                // Transfer tokens
                if (isNewOrderBuy) {
                    IERC20(newOrder.tokenA).safeTransfer(newOrder.trader, matchAmount);
                    IERC20(oppositeOrder.tokenB).safeTransfer(oppositeOrder.trader, tradeValueB);
                } else {
                    IERC20(oppositeOrder.tokenA).safeTransfer(oppositeOrder.trader, matchAmount);
                    IERC20(newOrder.tokenB).safeTransfer(newOrder.trader, tradeValueB);
                }
                
                emit OrderFilled(newOrderId, newOrder.trader, matchAmount, executionPrice);
                emit OrderFilled(oppositeOrderId, oppositeOrder.trader, matchAmount, executionPrice);
                
                // Mark orders as inactive if fully filled
                if (newOrder.filled >= newOrder.amountA) {
                    newOrder.isActive = false;
                }
                if (oppositeOrder.filled >= oppositeOrder.amountA) {
                    oppositeOrder.isActive = false;
                }
            }
        }
    }
    
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 feePercent
    ) public pure returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        
        uint256 amountInWithFee = amountIn * (10000 - feePercent);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10000) + amountInWithFee;
        amountOut = numerator / denominator;
    }
    
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure returns (uint256 amountB) {
        require(amountA > 0, "Insufficient amount");
        require(reserveA > 0 && reserveB > 0, "Insufficient liquidity");
        amountB = (amountA * reserveB) / reserveA;
    }
    
    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
    
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function getPool(bytes32 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }
    
    function getUserPosition(address user, bytes32 poolId) external view returns (UserPosition memory) {
        return positions[user][poolId];
    }
    
    function getUserOrders(address user) external view returns (uint256[] memory) {
        return userOrders[user];
    }
    
    function getOrder(bytes32 poolId, uint256 orderId, bool isBuyOrder) external view returns (Order memory) {
        OrderBook storage orderBook = orderBooks[poolId];
        return isBuyOrder ? orderBook.buyOrders[orderId] : orderBook.sellOrders[orderId];
    }
    
    function getAllPools() external view returns (bytes32[] memory) {
        return poolList;
    }
    
    function setProtocolFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        protocolFeePercent = _feePercent;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
