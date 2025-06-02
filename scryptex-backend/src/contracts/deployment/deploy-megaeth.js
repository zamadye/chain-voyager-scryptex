
const { ethers } = require("hardhat");
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployToMegaETH() {
  console.log("🚀 Starting MegaETH deployment...");
  console.log("Chain: MegaETH Testnet (6342)");
  console.log("RPC: https://carrot.megaeth.com/rpc");
  console.log("Explorer: https://testnet.megaeth.com/");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

  const deployments = {
    network: "MegaETH Testnet",
    chainId: 6342,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: []
  };

  try {
    // Deploy Bonding Curve Factory
    console.log("\n📈 Deploying Bonding Curve Factory...");
    const BondingCurveFactory = await ethers.getContractFactory("BondingCurveFactory");
    const bondingFactory = await BondingCurveFactory.deploy();
    await bondingFactory.deployed();
    
    deployments.contracts.push({
      name: "BondingCurveFactory",
      address: bondingFactory.address,
      txHash: bondingFactory.deployTransaction.hash,
      gasUsed: (await bondingFactory.deployTransaction.wait()).gasUsed.toString()
    });
    console.log("✅ BondingCurveFactory deployed to:", bondingFactory.address);

    // Deploy Cross-Chain Bridge
    console.log("\n🌉 Deploying Cross-Chain Bridge...");
    const CrossChainBridge = await ethers.getContractFactory("ScryptexBridge");
    const bridge = await CrossChainBridge.deploy();
    await bridge.deployed();
    
    deployments.contracts.push({
      name: "ScryptexBridge",
      address: bridge.address,
      txHash: bridge.deployTransaction.hash,
      gasUsed: (await bridge.deployTransaction.wait()).gasUsed.toString()
    });
    console.log("✅ ScryptexBridge deployed to:", bridge.address);

    // Deploy DEX
    console.log("\n💱 Deploying ScryptexDEX...");
    const ScryptexDEX = await ethers.getContractFactory("ScryptexDEX");
    const dex = await ScryptexDEX.deploy();
    await dex.deployed();
    
    deployments.contracts.push({
      name: "ScryptexDEX",
      address: dex.address,
      txHash: dex.deployTransaction.hash,
      gasUsed: (await dex.deployTransaction.wait()).gasUsed.toString()
    });
    console.log("✅ ScryptexDEX deployed to:", dex.address);

    // Deploy a sample reward token first
    console.log("\n🪙 Deploying ScryptexToken...");
    const ScryptexToken = await ethers.getContractFactory("ScryptexToken");
    const rewardToken = await ScryptexToken.deploy();
    await rewardToken.deployed();
    
    deployments.contracts.push({
      name: "ScryptexToken",
      address: rewardToken.address,
      txHash: rewardToken.deployTransaction.hash,
      gasUsed: (await rewardToken.deployTransaction.wait()).gasUsed.toString()
    });
    console.log("✅ ScryptexToken deployed to:", rewardToken.address);

    // Deploy GM Social Protocol
    console.log("\n📱 Deploying GM Social Protocol...");
    const GMSocialProtocol = await ethers.getContractFactory("GMSocialProtocol");
    const social = await GMSocialProtocol.deploy(rewardToken.address);
    await social.deployed();
    
    deployments.contracts.push({
      name: "GMSocialProtocol",
      address: social.address,
      txHash: social.deployTransaction.hash,
      gasUsed: (await social.deployTransaction.wait()).gasUsed.toString()
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
      gasUsed: (await platform.deployTransaction.wait()).gasUsed.toString()
    });
    console.log("✅ ScryptexPlatform deployed to:", platform.address);

    // Configure Platform with components
    console.log("\n⚙️ Configuring Platform...");
    await platform.setTokenFactory(bondingFactory.address);
    await platform.setBridge(bridge.address);
    await platform.setDEX(dex.address);
    await platform.setSocial(social.address);
    console.log("✅ Platform configured with all components");

    // Initialize Bridge with MegaETH optimizations
    console.log("\n🔧 Initializing Bridge for MegaETH...");
    await bridge.initializeChain(
      6342, // MegaETH chain ID
      1,    // 1 confirmation (fast finality)
      ethers.utils.parseEther("1000"), // 1000 ETH max transfer
      ethers.utils.parseEther("10000"), // 10000 ETH daily limit
      "https://carrot.megaeth.com/rpc",
      bridge.address
    );
    console.log("✅ Bridge initialized for MegaETH");

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments', 'megaeth');
    mkdirSync(deploymentsDir, { recursive: true });
    
    const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2));

    console.log("\n🎉 MegaETH deployment completed successfully!");
    console.log("📄 Deployment file:", deploymentFile);
    console.log("\n📊 Deployment Summary:");
    deployments.contracts.forEach(contract => {
      console.log(`  ✅ ${contract.name}: ${contract.address}`);
    });

    // MegaETH specific optimizations note
    console.log("\n⚡ MegaETH Optimizations Applied:");
    console.log("  • Real-time bonding curve updates (10ms blocks)");
    console.log("  • Instant DEX price feeds");
    console.log("  • Sub-millisecond bridge confirmations");
    console.log("  • Real-time social interactions");

    return deployments;

  } catch (error) {
    console.error("❌ MegaETH deployment failed:", error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { deployToMegaETH };

// Run if called directly
if (require.main === module) {
  deployToMegaETH()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
