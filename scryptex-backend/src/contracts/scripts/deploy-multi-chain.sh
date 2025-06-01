
#!/bin/bash

# SCRYPTEX Multi-Chain Deployment Script
# Usage: ./deploy-multi-chain.sh [chains...] [--type contract-type]

set -e

CHAINS=()
CONTRACT_TYPE="all"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            CONTRACT_TYPE="$2"
            shift 2
            ;;
        --help)
            echo "🚀 SCRYPTEX Multi-Chain Deployment Script"
            echo ""
            echo "Usage: ./deploy-multi-chain.sh [chains...] [--type contract-type]"
            echo ""
            echo "Options:"
            echo "  --type TYPE    Contract type to deploy (basic|tokens|defi|utility|all)"
            echo "  --help         Show this help message"
            echo ""
            echo "Available chains:"
            echo "  nexus zerog somnia aztec risechain megaeth"
            echo ""
            echo "Examples:"
            echo "  ./deploy-multi-chain.sh nexus zerog"
            echo "  ./deploy-multi-chain.sh nexus --type tokens"
            echo "  ./deploy-multi-chain.sh  # Deploys to all chains"
            exit 0
            ;;
        *)
            CHAINS+=("$1")
            shift
            ;;
    esac
done

# If no chains specified, use all supported chains
if [ ${#CHAINS[@]} -eq 0 ]; then
    CHAINS=("nexus" "zerog" "somnia" "aztec" "risechain" "megaeth")
fi

echo "🌐 SCRYPTEX Multi-Chain Deployment"
echo "=================================="
echo "Chains: ${CHAINS[*]}"
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

# Deploy to each chain
SUCCESSFUL=()
FAILED=()

for CHAIN in "${CHAINS[@]}"; do
    echo ""
    echo "🚀 Deploying to $CHAIN..."
    echo "------------------------"
    
    if ./scripts/deploy-to-chain.sh "$CHAIN" "$CONTRACT_TYPE"; then
        SUCCESSFUL+=("$CHAIN")
        echo "✅ $CHAIN deployment successful"
    else
        FAILED+=("$CHAIN")
        echo "❌ $CHAIN deployment failed"
    fi
done

echo ""
echo "🏁 Multi-Chain Deployment Summary"
echo "================================="
echo "✅ Successful (${#SUCCESSFUL[@]}): ${SUCCESSFUL[*]}"
echo "❌ Failed (${#FAILED[@]}): ${FAILED[*]}"
echo ""

if [ ${#FAILED[@]} -eq 0 ]; then
    echo "🎉 All deployments completed successfully!"
    exit 0
else
    echo "⚠️  Some deployments failed. Check logs above for details."
    exit 1
fi
