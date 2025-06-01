
const { ethers } = require('hardhat');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployDeFiContracts(chainConfig, tokenAddresses = {}) {
  console.log(`\n🚀 Deploying DeFi Contracts to ${chainConfig.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  const deployments = [];

  try {
    // Deploy SimpleSwap
    console.log('\n📦 Deploying SimpleSwap...');
    const SimpleSwap = await ethers.getContractFactory('SimpleSwap');
    const swap = await SimpleSwap.deploy();
    await swap.deployed();
    
    console.log(`✅ SimpleSwap deployed to: ${swap.address}`);
    deployments.push({
      name: 'SimpleSwap',
      address: swap.address,
      args: [],
      txHash: swap.deployTransaction.hash
    });

    // If token addresses are provided, create a pool
    if (tokenAddresses.tokenA && tokenAddresses.tokenB) {
      console.log('\n🏊 Creating token pool...');
      const createPoolTx = await swap.createPool(
        tokenAddresses.tokenA,
        tokenAddresses.tokenB,
        30 // 0.3% fee
      );
      const receipt = await createPoolTx.wait();
      
      // Extract pool ID from event
      const poolCreatedEvent = receipt.events?.find(e => e.event === 'PoolCreated');
      const poolId = poolCreatedEvent?.args?.poolId;
      
      console.log(`✅ Pool created with ID: ${poolId}`);
      
      deployments[0].poolId = poolId;
      deployments[0].tokenA = tokenAddresses.tokenA;
      deployments[0].tokenB = tokenAddresses.tokenB;
    }

    // Test swap functionality if tokens available
    if (tokenAddresses.tokenA && tokenAddresses.tokenB) {
      console.log('\n🧪 Testing swap functionality...');
      
      // This would require the deployer to have tokens to test with
      // In a real scenario, you'd need to mint tokens first
      console.log('⚠️  Manual testing required - ensure deployer has tokens to add liquidity');
    }

    // Save deployment info
    const deploymentInfo = {
      chainId: chainConfig.chainId,
      chainName: chainConfig.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployments,
      tokenAddresses,
      gasUsed: {
        SimpleSwap: (await swap.deployTransaction.wait()).gasUsed.toString()
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments', chainConfig.name.toLowerCase().replace(/\s+/g, '-'));
    mkdirSync(deploymentsDir, { recursive: true });

    // Write deployment file
    const deploymentFile = path.join(deploymentsDir, `defi-contracts-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
    console.log('\n🎉 DeFi contracts deployment completed successfully!');

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    throw error;
  }
}

module.exports = { deployDeFiContracts };

// If called directly
if (require.main === module) {
  deployDeFiContracts({
    chainId: 1,
    name: 'Test Network'
  }).catch(console.error);
}
