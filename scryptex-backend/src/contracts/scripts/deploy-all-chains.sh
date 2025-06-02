
#!/bin/bash

# SCRYPTEX Multi-Chain DeFi Platform Deployment
# Deploy complete ecosystem to MegaETH, RiseChain, and Sepolia

set -e

echo "🌐 SCRYPTEX Multi-Chain DeFi Platform Deployment"
echo "================================================"
echo "Deploying to: MegaETH, RiseChain, Sepolia"
echo "Features: Bonding Curves, Bridge, DEX, Social"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your private key and RPC URLs"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

# Create deployments directory
mkdir -p deployments/summary

# Track deployment results
SUCCESSFUL_DEPLOYMENTS=()
FAILED_DEPLOYMENTS=()

# Deploy to MegaETH
echo ""
echo "🚀 Deploying to MegaETH Testnet..."
echo "=================================="
if npx hardhat run deployment/deploy-megaeth.js --network megaeth; then
    SUCCESSFUL_DEPLOYMENTS+=("MegaETH")
    echo "✅ MegaETH deployment successful"
else
    FAILED_DEPLOYMENTS+=("MegaETH")
    echo "❌ MegaETH deployment failed"
fi

# Deploy to RiseChain
echo ""
echo "🚀 Deploying to RiseChain Testnet..."
echo "===================================="
if npx hardhat run deployment/deploy-risechain.js --network risechain; then
    SUCCESSFUL_DEPLOYMENTS+=("RiseChain")
    echo "✅ RiseChain deployment successful"
else
    FAILED_DEPLOYMENTS+=("RiseChain")
    echo "❌ RiseChain deployment failed"
fi

# Deploy to Sepolia
echo ""
echo "🚀 Deploying to Sepolia Testnet..."
echo "=================================="
if npx hardhat run deployment/deploy-sepolia.js --network sepolia; then
    SUCCESSFUL_DEPLOYMENTS+=("Sepolia")
    echo "✅ Sepolia deployment successful"
else
    FAILED_DEPLOYMENTS+=("Sepolia")
    echo "❌ Sepolia deployment failed"
fi

# Generate summary report
echo ""
echo "🏁 Multi-Chain Deployment Summary"
echo "================================="
echo "✅ Successful (${#SUCCESSFUL_DEPLOYMENTS[@]}): ${SUCCESSFUL_DEPLOYMENTS[*]}"
echo "❌ Failed (${#FAILED_DEPLOYMENTS[@]}): ${FAILED_DEPLOYMENTS[*]}"

# Create summary JSON
SUMMARY_FILE="deployments/summary/multi-chain-summary-$(date +%s).json"
cat > "$SUMMARY_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "successful": [$(printf '"%s",' "${SUCCESSFUL_DEPLOYMENTS[@]}" | sed 's/,$//')]",
  "failed": [$(printf '"%s",' "${FAILED_DEPLOYMENTS[@]}" | sed 's/,$//')]",
  "features_deployed": [
    "Bonding Curve Token Factory",
    "Cross-Chain Bridge Infrastructure", 
    "Advanced Decentralized Exchange",
    "GM Social Protocol",
    "Unified Platform Controller"
  ],
  "optimizations": {
    "megaeth": [
      "Real-time bonding curves (10ms blocks)",
      "Instant DEX price feeds",
      "Sub-millisecond bridge confirmations",
      "Real-time social interactions"
    ],
    "risechain": [
      "Gigagas throughput optimization",
      "Shreds parallel validation",
      "Parallel DEX order processing",
      "Parallel content indexing"
    ],
    "sepolia": [
      "Proof-of-Stake security",
      "MEV protection mechanisms",
      "Ethereum ecosystem compatibility",
      "ENS identity integration"
    ]
  }
}
EOF

echo "📄 Summary report: $SUMMARY_FILE"

if [ ${#FAILED_DEPLOYMENTS[@]} -eq 0 ]; then
    echo ""
    echo "🎉 ALL DEPLOYMENTS COMPLETED SUCCESSFULLY!"
    echo ""
    echo "🌟 SCRYPTEX Multi-Chain DeFi Platform is now live on:"
    echo "   • MegaETH Testnet (Real-time trading)"
    echo "   • RiseChain Testnet (Gigagas throughput)"  
    echo "   • Sepolia Testnet (Ethereum compatibility)"
    echo ""
    echo "🔗 Platform Features:"
    echo "   • Bonding Curve Token Creation"
    echo "   • Cross-Chain Asset Bridging"
    echo "   • Advanced DEX with Order Books"
    echo "   • GM Social Protocol with Rewards"
    echo "   • Unified Multi-Chain Management"
    echo ""
    echo "📚 Next Steps:"
    echo "   1. Configure frontend with deployed addresses"
    echo "   2. Set up bridge validators"
    echo "   3. Initialize liquidity pools"
    echo "   4. Deploy UI and start user onboarding"
    exit 0
else
    echo ""
    echo "⚠️  Some deployments failed. Check individual chain logs for details."
    echo "💡 You can retry failed deployments individually:"
    for chain in "${FAILED_DEPLOYMENTS[@]}"; do
        echo "   npx hardhat run deployment/deploy-$(echo $chain | tr '[:upper:]' '[:lower:]').js --network $(echo $chain | tr '[:upper:]' '[:lower:]')"
    done
    exit 1
fi
