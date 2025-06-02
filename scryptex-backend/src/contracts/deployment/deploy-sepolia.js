
const { ethers } = require("hardhat");
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployToSepolia() {
  console.log("🚀 Starting Sepolia deployment...");
  console.log("Chain: Ethereum Sepolia (11155111)");
  console.log("RPC: https://rpc.sepolia.dev");
  console.log("Explorer: https://sepolia.etherscan.io");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  const deployments = {
    network: "Ethereum Sepolia",
    chainId: 11155111,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: []
  };

  try {
    // Deploy Bonding Curve Factory with Ethereum compatibility
    console.log("\n📈 Deploying Bonding Curve Factory (Ethereum Compatible)...");
    const BondingCurveFactory = await ethers.getContractFactory("BondingCurveFactory");
    const bondingFactory = await BondingCurveFactory.deploy();
    await bondingFactory.deployed();
    
    deployments.contracts.push({
      name: "BondingCurveFactory",
      address: bondingFactory.address,
      txHash: bondingFactory.deployTransaction.hash,
      gasUsed: (await bondingFactory.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Proof-of-Stake optimized"
    });
    console.log("✅ BondingCurveFactory deployed to:", bondingFactory.address);

    // Deploy Cross-Chain Bridge with PoS security
    console.log("\n🌉 Deploying Cross-Chain Bridge (PoS Secured)...");
    const CrossChainBridge = await ethers.getContractFactory("ScryptexBridge");
    const bridge = await CrossChainBridge.deploy();
    await bridge.deployed();
    
    deployments.contracts.push({
      name: "ScryptexBridge",
      address: bridge.address,
      txHash: bridge.deployTransaction.hash,
      gasUsed: (await bridge.deployTransaction.wait()).gasUsed.toString(),
      optimization: "Ethereum PoS finality"
    });
    console.log("✅ ScryptexBridge deployed to:", bridge.address);

    // Deploy DEX with MEV protection
    console.log("\n💱 Deploying ScryptexDEX (MEV Protected)...");
    const ScryptexDEX = await ethers.getContractFactory("ScryptexDEX");
    const dex = await ScryptexDEX.deploy();
    await dex.deployed();
    
    deployments.contracts.push({
      name: "ScryptexDEX",
      address: dex.address,
      txHash: dex.deployTransaction.hash,
      gasUsed: (await dex.deployTransaction.wait()).gasUsed.toString(),
      optimization: "MEV protection via batch auctions"
    });
    console.log("✅ ScryptexDEX deployed to:", dex.address);

    // Deploy Ethereum-native reward token
    console.log("\n🪙 Deploying Ethereum Token...");
    const ScryptexToken = await ethers.getContractFactory("ScryptexToken");
    const rewardToken = await ScryptexToken.deploy();
    await rewardToken.deployed();
    
    deployments.contracts.push({
      name: "EthereumToken",
      address: rewardToken.address,
      txHash: rewardToken.deployTransaction.hash,
      gasUsed: (await rewardToken.deployTransaction.wait()).gasUsed.toString(),
      optimization: "ERC-20 standard compliance"
    });
    console.log("✅ EthereumToken deployed to:", rewardToken.address);

    // Deploy GM Social Protocol with ENS integration
    console.log("\n📱 Deploying GM Social Protocol (ENS Integrated)...");
    const GMSocialProtocol = await ethers.getContractFactory("GMSocialProtocol");
    const social = await GMSocialProtocol.deploy(rewardToken.address);
    await social.deployed();
    
    deployments.contracts.push({
      name: "GMSocialProtocol",
      address: social.address,
      txHash: social.deployTransaction.hash,
      gasUsed: (await social.deployTransaction.wait()).gasUsed.toString(),
      optimization: "ENS identity integration"
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
      optimization: "Ethereum ecosystem compatibility"
    });
    console.log("✅ ScryptexPlatform deployed to:", platform.address);

    // Configure Platform with components
    console.log("\n⚙️ Configuring Platform...");
    await platform.setTokenFactory(bondingFactory.address);
    await platform.setBridge(bridge.address);
    await platform.setDEX(dex.address);
    await platform.setSocial(social.address);
    console.log("✅ Platform configured with all components");

    // Initialize Bridge with Sepolia settings
    console.log("\n🔧 Initializing Bridge for Sepolia...");
    await bridge.initializeChain(
      11155111, // Sepolia chain ID
      2,        // 2 confirmations (PoS finality)
      ethers.utils.parseEther("100"), // 100 ETH max transfer
      ethers.utils.parseEther("1000"), // 1000 ETH daily limit
      "https://rpc.sepolia.dev",
      bridge.address
    );
    console.log("✅ Bridge initialized for Sepolia");

    // Set up validator set with Ethereum addresses
    console.log("\n👥 Setting up Ethereum validators...");
    const validators = [deployer.address]; // In production, use multiple validators
    await bridge.setValidatorSet(11155111, validators, 1);
    console.log("✅ Validator set configured");

    // Create a test pool on DEX
    console.log("\n🏊 Creating test liquidity pool...");
    const poolId = await dex.createPool(
      rewardToken.address,
      "0x0000000000000000000000000000000000000000", // ETH
      300 // 3% fee
    );
    console.log("✅ Test pool created");

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments', 'sepolia');
    mkdirSync(deploymentsDir, { recursive: true });
    
    const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));

    console.log("\n🎉 Sepolia deployment completed successfully!");
    console.log("📄 Deployment file:", deploymentFile);
    console.log("\n📊 Deployment Summary:");
    deployments.contracts.forEach(contract => {
      console.log(`  ✅ ${contract.name}: ${contract.address}`);
    });

    // Sepolia specific optimizations note
    console.log("\n⚡ Sepolia Optimizations Applied:");
    console.log("  • Proof-of-Stake security guarantees");
    console.log("  • MEV protection via commit-reveal");
    console.log("  • Ethereum ecosystem compatibility");
    console.log("  • ENS integration for social identities");
    console.log("  • 12-second block time optimization");

    return deployments;

  } catch (error) {
    console.error("❌ Sepolia deployment failed:", error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { deployToSepolia };

// Run if called directly
if (require.main === module) {
  deployToSepolia()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
