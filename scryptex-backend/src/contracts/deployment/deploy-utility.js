
const { ethers } = require('hardhat');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployUtilityContracts(chainConfig) {
  console.log(`\n🚀 Deploying Utility Contracts to ${chainConfig.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  const deployments = [];

  try {
    // Deploy GMRitual
    console.log('\n📦 Deploying GMRitual...');
    const GMRitual = await ethers.getContractFactory('GMRitual');
    const gmRitual = await GMRitual.deploy();
    await gmRitual.deployed();
    
    console.log(`✅ GMRitual deployed to: ${gmRitual.address}`);
    deployments.push({
      name: 'GMRitual',
      address: gmRitual.address,
      args: [],
      txHash: gmRitual.deployTransaction.hash
    });

    // Fund GM contract with some ETH for rewards
    console.log('\n💰 Funding GMRitual contract...');
    const fundAmount = ethers.utils.parseEther('1'); // 1 ETH
    const fundTx = await gmRitual.fundContract({ value: fundAmount });
    await fundTx.wait();
    console.log(`✅ Funded GMRitual with ${ethers.utils.formatEther(fundAmount)} ETH`);

    // Deploy TestnetFaucet
    console.log('\n📦 Deploying TestnetFaucet...');
    const TestnetFaucet = await ethers.getContractFactory('TestnetFaucet');
    const faucet = await TestnetFaucet.deploy();
    await faucet.deployed();
    
    console.log(`✅ TestnetFaucet deployed to: ${faucet.address}`);
    deployments.push({
      name: 'TestnetFaucet',
      address: faucet.address,
      args: [],
      txHash: faucet.deployTransaction.hash
    });

    // Fund faucet with some ETH
    console.log('\n💰 Funding TestnetFaucet...');
    const faucetFundAmount = ethers.utils.parseEther('5'); // 5 ETH
    const faucetFundTx = await deployer.sendTransaction({
      to: faucet.address,
      value: faucetFundAmount
    });
    await faucetFundTx.wait();
    console.log(`✅ Funded TestnetFaucet with ${ethers.utils.formatEther(faucetFundAmount)} ETH`);

    // Test GM functionality
    console.log('\n🧪 Testing GM functionality...');
    const gmTx = await gmRitual.postGM(`First GM on ${chainConfig.name}! 🌅`);
    await gmTx.wait();
    console.log('✅ Posted first GM message');

    // Set username
    const usernameTx = await gmRitual.setUsername('ScryptexDeployer');
    await usernameTx.wait();
    console.log('✅ Set deployer username');

    // Test faucet functionality
    console.log('\n🧪 Testing faucet functionality...');
    // Note: This would fail due to cooldown, but shows the pattern
    console.log('⚠️  Faucet drip test skipped (cooldown period)');

    // Save deployment info
    const deploymentInfo = {
      chainId: chainConfig.chainId,
      chainName: chainConfig.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployments,
      funding: {
        gmRitual: fundAmount.toString(),
        faucet: faucetFundAmount.toString()
      },
      gasUsed: {
        GMRitual: (await gmRitual.deployTransaction.wait()).gasUsed.toString(),
        TestnetFaucet: (await faucet.deployTransaction.wait()).gasUsed.toString()
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments', chainConfig.name.toLowerCase().replace(/\s+/g, '-'));
    mkdirSync(deploymentsDir, { recursive: true });

    // Write deployment file
    const deploymentFile = path.join(deploymentsDir, `utility-contracts-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
    console.log('\n🎉 Utility contracts deployment completed successfully!');

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    throw error;
  }
}

module.exports = { deployUtilityContracts };

// If called directly
if (require.main === module) {
  deployUtilityContracts({
    chainId: 1,
    name: 'Test Network'
  }).catch(console.error);
}
