
const { ethers } = require("hardhat");
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployToRiseChain() {
  console.log("🚀 Starting RiseChain deployment...");
  console.log("Chain: RiseChain Testnet (11155931)");
  console.log("RPC: https://testnet.riselabs.xyz");
  console.log("Explorer: https://explorer.testnet.riselabs.xyz");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  const deployments = {
    network: "RiseChain Testnet",
    chainId: 11155931,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: []
  };

  try {
    // Deploy Bonding Curve Factory with RiseChain optimizations
    console.log("\n📈 Deploying Bonding Curve Factory (RiseChain Optimized)...");
    const BondingCurveFactory = await ethers.getContractFactory("BondingCurveFactory");
    const bondingFactory = await BondingCurveFactory.deploy();
    await bondingFactory.deployed();
    
    deployments.contracts.push({
      name: "BondingCurveFactory",
      address: bondingFactory.address,
      txHash: bondingFactory.deployTransaction.hash,
      gasUsed: (await bondingFactory.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Gigagas parallel processing"
    });
    console.log("✅ BondingCurveFactory deployed to:", bondingFactory.address);

    // Deploy Cross-Chain Bridge with Shreds integration
    console.log("\n🌉 Deploying Cross-Chain Bridge (Shreds Enabled)...");
    const CrossChainBridge = await ethers.getContractFactory("ScryptexBridge");
    const bridge = await CrossChainBridge.deploy();
    await bridge.deployed();
    
    deployments.contracts.push({
      name: "ScryptexBridge",
      address: bridge.address,
      txHash: bridge.deployTransaction.hash,
      gasUsed: (await bridge.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Shreds parallel validation"
    });
    console.log("✅ ScryptexBridge deployed to:", bridge.address);

    // Deploy DEX with parallel order matching
    console.log("\n💱 Deploying ScryptexDEX (Parallel Execution)...");
    const ScryptexDEX = await ethers.getContractFactory("ScryptexDEX");
    const dex = await ScryptexDEX.deploy();
    await dex.deployed();
    
    deployments.contracts.push({
      name: "ScryptexDEX",
      address: dex.address,
      txHash: dex.deployTransaction.hash,
      gasUsed: (await dex.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Parallel order book processing"
    });
    console.log("✅ ScryptexDEX deployed to:", dex.address);

    // Deploy RiseChain optimized reward token
    console.log("\n🪙 Deploying RiseChain Token...");
    const ScryptexToken = await ethers.getContractFactory("ScryptexToken");
    const rewardToken = await ScryptexToken.deploy();
    await rewardToken.deployed();
    
    deployments.contracts.push({
      name: "RiseChainToken",
      address: rewardToken.address,
      txHash: rewardToken.deployTransaction.hash,
      gasUsed: (await rewardToken.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Gigagas transfer optimization"
    });
    console.log("✅ RiseChainToken deployed to:", rewardToken.address);

    // Deploy GM Social Protocol with parallel content processing
    console.log("\n📱 Deploying GM Social Protocol (Parallel Content)...");
    const GMSocialProtocol = await ethers.getContractFactory("GMSocialProtocol");
    const social = await GMSocialProtocol.deploy(rewardToken.address);
    await social.deployed();
    
    deployments.contracts.push({
      name: "GMSocialProtocol",
      address: social.address,
      txHash: social.deployTransaction.hash,
      gasUsed: (await social.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Parallel content indexing"
    });
    console.log("✅ GMSocialProtocol deployed to:", social.address);

    // Deploy Platform Controller
    console.log("\n🏗️ Deploying Platform Controller...");
    const ScryptexPlatform = await ethers.getContractFactory("ScryptexPlatform");
    const platform = await ScryptexPlatform.deploy(deployer.address);
    await platform.deployed();
    
    deployments.contracts.push({
      name: "ScryptexPlatform",
      address: platform.address,
      txHash: platform.deployTransaction.hash,
      gasUsed: (await platform.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Multi-component parallel execution"
    });
    console.log("✅ ScryptexPlatform deployed to:", platform.address);

    // Configure Platform with components
    console.log("\n⚙️ Configuring Platform...");
    await platform.setTokenFactory(bondingFactory.address);
    await platform.setBridge(bridge.address);
    await platform.setDEX(dex.address);
    await platform.setSocial(social.address);
    console.log("✅ Platform configured with all components");

    // Initialize Bridge with RiseChain optimizations
    console.log("\n🔧 Initializing Bridge for RiseChain...");
    await bridge.initializeChain(
      11155931, // RiseChain chain ID
      1,        // 1 confirmation (Shreds fast finality)
      ethers.utils.parseEther("5000"), // 5000 RISE max transfer
      ethers.utils.parseEther("50000"), // 50000 RISE daily limit
      "https://testnet.riselabs.xyz",
      bridge.address
    );
    console.log("✅ Bridge initialized for RiseChain");

    // Set up validator set for parallel validation
    console.log("\n👥 Setting up RiseChain validators...");
    const validators = [deployer.address]; // In production, use multiple validators
    await bridge.setValidatorSet(11155931, validators, 1);
    console.log("✅ Validator set configured");

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments', 'risechain');
    mkdirSync(deploymentsDir, { recursive: true });
    
    const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));

    console.log("\n🎉 RiseChain deployment completed successfully!");
    console.log("📄 Deployment file:", deploymentFile);
    console.log("\n📊 Deployment Summary:");
    deployments.contracts.forEach(contract => {
      console.log(`  ✅ ${contract.name}: ${contract.address}`);
    });

    // RiseChain specific optimizations note
    console.log("\n⚡ RiseChain Optimizations Applied:");
    console.log("  • Gigagas throughput for token operations");
    console.log("  • Shreds parallel validation for bridge");
    console.log("  • Parallel DEX order book processing");
    console.log("  • Parallel content indexing for social");
    console.log("  • 100ms settlement via Shreds technology");

    return deployments;

  } catch (error) {
    console.error("❌ RiseChain deployment failed:", error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { deployToRiseChain };

// Run if called directly
if (require.main === module) {
  deployToRiseChain()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
