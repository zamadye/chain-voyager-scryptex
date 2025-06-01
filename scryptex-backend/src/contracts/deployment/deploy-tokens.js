
const { ethers } = require('hardhat');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

async function deployTokenContracts(chainConfig, params = {}) {
  console.log(`\n🚀 Deploying Token Contracts to ${chainConfig.name}...`);
  
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

  const deployments = [];

  try {
    // Deploy ScryptexToken
    console.log('\n📦 Deploying ScryptexToken...');
    const tokenName = params.tokenName || `Scryptex ${chainConfig.name} Token`;
    const tokenSymbol = params.tokenSymbol || `SCX${chainConfig.name.substring(0, 3).toUpperCase()}`;
    const initialSupply = params.initialSupply || ethers.utils.parseEther('1000000'); // 1M tokens

    const ScryptexToken = await ethers.getContractFactory('ScryptexToken');
    const token = await ScryptexToken.deploy(tokenName, tokenSymbol, initialSupply);
    await token.deployed();
    
    console.log(`✅ ScryptexToken deployed to: ${token.address}`);
    deployments.push({
      name: 'ScryptexToken',
      address: token.address,
      args: [tokenName, tokenSymbol, initialSupply.toString()],
      txHash: token.deployTransaction.hash
    });

    // Deploy ScryptexNFT
    console.log('\n📦 Deploying ScryptexNFT...');
    const nftName = params.nftName || `Scryptex ${chainConfig.name} NFT`;
    const nftSymbol = params.nftSymbol || `SCXNFT${chainConfig.name.substring(0, 2).toUpperCase()}`;
    const baseURI = params.baseURI || `https://api.scryptex.io/nft/${chainConfig.chainId}/`;

    const ScryptexNFT = await ethers.getContractFactory('ScryptexNFT');
    const nft = await ScryptexNFT.deploy(nftName, nftSymbol, baseURI);
    await nft.deployed();
    
    console.log(`✅ ScryptexNFT deployed to: ${nft.address}`);
    deployments.push({
      name: 'ScryptexNFT',
      address: nft.address,
      args: [nftName, nftSymbol, baseURI],
      txHash: nft.deployTransaction.hash
    });

    // Test token functionality
    console.log('\n🧪 Testing token functionality...');
    
    // Test minting to deployer
    const mintAmount = ethers.utils.parseEther('1000');
    const mintTx = await token.mint(deployer.address, mintAmount, { value: ethers.utils.parseEther('0.001') });
    await mintTx.wait();
    console.log(`✅ Minted ${ethers.utils.formatEther(mintAmount)} tokens to deployer`);

    // Test NFT minting
    const mintNFTTx = await nft.mint(deployer.address, 'test-metadata-uri');
    await mintNFTTx.wait();
    console.log(`✅ Minted NFT #0 to deployer`);

    // Save deployment info
    const deploymentInfo = {
      chainId: chainConfig.chainId,
      chainName: chainConfig.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployments,
      parameters: {
        token: {
          name: tokenName,
          symbol: tokenSymbol,
          initialSupply: initialSupply.toString()
        },
        nft: {
          name: nftName,
          symbol: nftSymbol,
          baseURI: baseURI
        }
      },
      gasUsed: {
        ScryptexToken: (await token.deployTransaction.wait()).gasUsed.toString(),
        ScryptexNFT: (await nft.deployTransaction.wait()).gasUsed.toString()
      }
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments', chainConfig.name.toLowerCase().replace(/\s+/g, '-'));
    mkdirSync(deploymentsDir, { recursive: true });

    // Write deployment file
    const deploymentFile = path.join(deploymentsDir, `token-contracts-${Date.now()}.json`);
    writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
    console.log('\n🎉 Token contracts deployment completed successfully!');

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    throw error;
  }
}

module.exports = { deployTokenContracts };

// If called directly
if (require.main === module) {
  deployTokenContracts({
    chainId: 1,
    name: 'Test Network'
  }).catch(console.error);
}
