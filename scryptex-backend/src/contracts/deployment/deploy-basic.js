
const { ethers } = require('hardhat');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployBasicContracts(chainConfig) {
  console.log(`\n🚀 Deploying Basic Contracts to ${chainConfig.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  const deployments = [];

  try {
    // Deploy SimpleStorage
    console.log('\n📦 Deploying SimpleStorage...');
    const SimpleStorage = await ethers.getContractFactory('SimpleStorage');
    const simpleStorage = await SimpleStorage.deploy(42);
    await simpleStorage.deployed();
    
    console.log(`✅ SimpleStorage deployed to: ${simpleStorage.address}`);
    deployments.push({
      name: 'SimpleStorage',
      address: simpleStorage.address,
      args: [42],
      txHash: simpleStorage.deployTransaction.hash
    });

    // Deploy TestnetGreeter
    console.log('\n📦 Deploying TestnetGreeter...');
    const TestnetGreeter = await ethers.getContractFactory('TestnetGreeter');
    const greeter = await TestnetGreeter.deploy(`Hello from ${chainConfig.name}!`);
    await greeter.deployed();
    
    console.log(`✅ TestnetGreeter deployed to: ${greeter.address}`);
    deployments.push({
      name: 'TestnetGreeter',
      address: greeter.address,
      args: [`Hello from ${chainConfig.name}!`],
      txHash: greeter.deployTransaction.hash
    });

    // Save deployment info
    const deploymentInfo = {
      chainId: chainConfig.chainId,
      chainName: chainConfig.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployments,
      gasUsed: {
        SimpleStorage: (await simpleStorage.deployTransaction.wait()).gasUsed.toString(),
        TestnetGreeter: (await greeter.deployTransaction.wait()).gasUsed.toString()
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments', chainConfig.name.toLowerCase().replace(/\s+/g, '-'));
    mkdirSync(deploymentsDir, { recursive: true });

    // Write deployment file
    const deploymentFile = path.join(deploymentsDir, `basic-contracts-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
    console.log('\n🎉 Basic contracts deployment completed successfully!');

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    throw error;
  }
}

module.exports = { deployBasicContracts };

// If called directly
if (require.main === module) {
  deployBasicContracts({
    chainId: 1,
    name: 'Test Network'
  }).catch(console.error);
}
