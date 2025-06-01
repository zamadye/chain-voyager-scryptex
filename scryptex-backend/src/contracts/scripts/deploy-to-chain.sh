
#!/bin/bash

# SCRYPTEX Contract Deployment Script
# Usage: ./deploy-to-chain.sh <chain-name> [contract-type]

set -e

CHAIN_NAME=$1
CONTRACT_TYPE=$2

if [ -z "$CHAIN_NAME" ]; then
    echo "❌ Error: Chain name is required"
    echo "Usage: ./deploy-to-chain.sh <chain-name> [contract-type]"
    echo ""
    echo "Available chains:"
    echo "  - nexus"
    echo "  - zerog" 
    echo "  - somnia"
    echo "  - aztec"
    echo "  - risechain"
    echo "  - megaeth"
    echo ""
    echo "Available contract types:"
    echo "  - basic (default)"
    echo "  - tokens"
    echo "  - defi"
    echo "  - utility"
    echo "  - all"
    exit 1
fi

# Set default contract type
if [ -z "$CONTRACT_TYPE" ]; then
    CONTRACT_TYPE="basic"
fi

echo "🚀 SCRYPTEX Contract Deployment"
echo "=============================="
echo "Chain: $CHAIN_NAME"
echo "Contract Type: $CONTRACT_TYPE"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

# Deploy based on contract type
case $CONTRACT_TYPE in
    "basic")
        echo "📝 Deploying basic contracts to $CHAIN_NAME..."
        npx hardhat run deployment/deploy-basic.js --network $CHAIN_NAME
        ;;
    "tokens")
        echo "🪙 Deploying token contracts to $CHAIN_NAME..."
        npx hardhat run deployment/deploy-tokens.js --network $CHAIN_NAME
        ;;
    "defi")
        echo "🏦 Deploying DeFi contracts to $CHAIN_NAME..."
        npx hardhat run deployment/deploy-defi.js --network $CHAIN_NAME
        ;;
    "utility")
        echo "🔧 Deploying utility contracts to $CHAIN_NAME..."
        npx hardhat run deployment/deploy-utility.js --network $CHAIN_NAME
        ;;
    "all")
        echo "🌟 Deploying all contracts to $CHAIN_NAME..."
        node deployment/deploy-all.js single $CHAIN_NAME
        ;;
    *)
        echo "❌ Error: Unknown contract type '$CONTRACT_TYPE'"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment completed successfully!"
echo "📁 Check the deployments/ directory for deployment details."
