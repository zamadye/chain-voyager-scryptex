
const { deployBasicContracts } = require('./deploy-basic');
const { deployTokenContracts } = require('./deploy-tokens');
const { deployDeFiContracts } = require('./deploy-defi');
const { deployUtilityContracts } = require('./deploy-utility');
const { writeFileSync, mkdirSync } = require('fs');
const path = require('path');

// Chain configurations
const SUPPORTED_CHAINS = {
  'nexus': {
    chainId: 4242424,
    name: 'Nexus Testnet',
    rpcUrl: 'https://rpc.testnet.nexus.xyz',
    explorerUrl: 'https://explorer.testnet.nexus.xyz'
  },
  'zerog': {
    chainId: 16600,
    name: '0G Galileo Testnet',
    rpcUrl: 'https://rpc-testnet.0g.ai',
    explorerUrl: 'https://explorer-testnet.0g.ai'
  },
  'somnia': {
    chainId: 50311,
    name: 'Somnia Testnet',
    rpcUrl: 'https://rpc.testnet.somnia.network',
    explorerUrl: 'https://explorer.testnet.somnia.network'
  },
  'aztec': {
    chainId: 677868,
    name: 'Aztec Testnet',
    rpcUrl: 'https://rpc.testnet.aztec.network',
    explorerUrl: 'https://explorer.testnet.aztec.network'
  },
  'risechain': {
    chainId: 5555555,
    name: 'RiseChain Testnet',
    rpcUrl: 'https://rpc.testnet.risechain.io',
    explorerUrl: 'https://explorer.testnet.risechain.io'
  },
  'megaeth': {
    chainId: 12345,
    name: 'MegaETH Testnet',
    rpcUrl: 'https://rpc.testnet.megaeth.org',
    explorerUrl: 'https://explorer.testnet.megaeth.org'
  }
};

async function deployToChain(chainKey, options = {}) {
  const chainConfig = SUPPORTED_CHAINS[chainKey];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chainKey}`);
  }

  console.log(`\n🌐 Starting deployment to ${chainConfig.name}`);
  console.log(`Chain ID: ${chainConfig.chainId}`);
  console.log(`RPC URL: ${chainConfig.rpcUrl}`);
  console.log('=' .repeat(60));

  const allDeployments = {
    chainConfig,
    timestamp: new Date().toISOString(),
    deployments: {}
  };

  try {
    // Deploy in sequence with dependencies
    
    // 1. Deploy basic contracts first
    if (options.includeBasic !== false) {
      console.log('\n📝 Step 1: Deploying Basic Contracts...');
      allDeployments.deployments.basic = await deployBasicContracts(chainConfig);
    }

    // 2. Deploy token contracts
    if (options.includeTokens !== false) {
      console.log('\n🪙 Step 2: Deploying Token Contracts...');
      allDeployments.deployments.tokens = await deployTokenContracts(chainConfig, options.tokenParams);
    }

    // 3. Deploy DeFi contracts (depends on tokens)
    if (options.includeDeFi !== false && allDeployments.deployments.tokens) {
      console.log('\n🏦 Step 3: Deploying DeFi Contracts...');
      const tokenAddresses = {
        tokenA: allDeployments.deployments.tokens.contracts.find(c => c.name === 'ScryptexToken')?.address,
        tokenB: process.env.WETH_ADDRESS // Would need wrapped ETH or another token
      };
      allDeployments.deployments.defi = await deployDeFiContracts(chainConfig, tokenAddresses);
    }

    // 4. Deploy utility contracts
    if (options.includeUtility !== false) {
      console.log('\n🔧 Step 4: Deploying Utility Contracts...');
      allDeployments.deployments.utility = await deployUtilityContracts(chainConfig);
    }

    // Save comprehensive deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments', chainConfig.name.toLowerCase().replace(/\s+/g, '-'));
    mkdirSync(deploymentsDir, { recursive: true });

    const masterDeploymentFile = path.join(deploymentsDir, `master-deployment-${Date.now()}.json`);
    writeFileSync(masterDeploymentFile, JSON.stringify(allDeployments, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Full deployment to ${chainConfig.name} completed successfully!`);
    console.log(`📄 Master deployment file: ${masterDeploymentFile}`);
    console.log('='.repeat(60));

    // Summary
    console.log('\n📊 Deployment Summary:');
    Object.entries(allDeployments.deployments).forEach(([category, deployment]) => {
      console.log(`  ${category.toUpperCase()}:`);
      deployment.contracts.forEach(contract => {
        console.log(`    ✅ ${contract.name}: ${contract.address}`);
      });
    });

    return allDeployments;

  } catch (error) {
    console.error(`\n❌ Deployment to ${chainConfig.name} failed:`, error);
    throw error;
  }
}

async function deployToMultipleChains(chainKeys, options = {}) {
  console.log('\n🚀 Starting multi-chain deployment...');
  console.log(`Chains: ${chainKeys.join(', ')}`);
  
  const results = {};
  const errors = {};

  for (const chainKey of chainKeys) {
    try {
      console.log(`\n📡 Deploying to ${chainKey}...`);
      results[chainKey] = await deployToChain(chainKey, options);
    } catch (error) {
      console.error(`❌ Failed to deploy to ${chainKey}:`, error.message);
      errors[chainKey] = error.message;
    }
  }

  // Save multi-chain deployment summary
  const summary = {
    timestamp: new Date().toISOString(),
    successful: Object.keys(results),
    failed: Object.keys(errors),
    results,
    errors
  };

  const summaryFile = path.join(__dirname, '..', 'deployments', `multi-chain-summary-${Date.now()}.json`);
  mkdirSync(path.dirname(summaryFile), { recursive: true });
  writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log('\n' + '='.repeat(80));
  console.log('🌐 MULTI-CHAIN DEPLOYMENT COMPLETE');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${summary.successful.length} chains`);
  console.log(`❌ Failed: ${summary.failed.length} chains`);
  console.log(`📄 Summary file: ${summaryFile}`);
  console.log('='.repeat(80));

  return summary;
}

module.exports = {
  deployToChain,
  deployToMultipleChains,
  SUPPORTED_CHAINS
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'single':
      const chainKey = args[1];
      if (!chainKey) {
        console.error('Usage: node deploy-all.js single <chain-key>');
        process.exit(1);
      }
      deployToChain(chainKey).catch(console.error);
      break;

    case 'multi':
      const chains = args.slice(1);
      if (chains.length === 0) {
        console.error('Usage: node deploy-all.js multi <chain1> <chain2> ...');
        process.exit(1);
      }
      deployToMultipleChains(chains).catch(console.error);
      break;

    case 'all':
      deployToMultipleChains(Object.keys(SUPPORTED_CHAINS)).catch(console.error);
      break;

    default:
      console.log('Available commands:');
      console.log('  single <chain-key>     - Deploy to single chain');
      console.log('  multi <chain1> <chain2> - Deploy to multiple chains');
      console.log('  all                    - Deploy to all supported chains');
      console.log('\nSupported chains:', Object.keys(SUPPORTED_CHAINS).join(', '));
  }
}
