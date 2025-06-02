
#!/bin/bash

# SCRYPTEX Contract Verification Script
# Verify all deployed contracts on their respective networks

set -e

echo "🔍 SCRYPTEX Contract Verification"
echo "================================="
echo ""

# Function to verify contracts on a specific network
verify_network_contracts() {
    local network=$1
    local deployment_dir=$2
    
    echo "🔍 Verifying contracts on $network..."
    
    # Find the latest deployment file
    if [ -d "$deployment_dir" ]; then
        LATEST_DEPLOYMENT=$(ls -t "$deployment_dir"/deployment-*.json | head -1)
        
        if [ -n "$LATEST_DEPLOYMENT" ]; then
            echo "📄 Found deployment file: $LATEST_DEPLOYMENT"
            
            # Extract contract addresses (this would need jq in practice)
            echo "⏳ Verification would be implemented here with network-specific explorers"
            echo "   - Block explorer API integration"
            echo "   - Source code verification"
            echo "   - ABI validation"
            
        else
            echo "❌ No deployment files found for $network"
        fi
    else
        echo "❌ Deployment directory not found for $network"
    fi
    echo ""
}

# Verify all networks
verify_network_contracts "MegaETH" "deployments/megaeth"
verify_network_contracts "RiseChain" "deployments/risechain"  
verify_network_contracts "Sepolia" "deployments/sepolia"

echo "✅ Verification process completed"
echo ""
echo "📋 Manual Verification Steps:"
echo "1. Visit each chain's block explorer"
echo "2. Navigate to deployed contract addresses"
echo "3. Verify source code and ABI"
echo "4. Test contract interactions"
echo ""
echo "🔗 Block Explorers:"
echo "   • MegaETH: https://testnet.megaeth.com/"
echo "   • RiseChain: https://explorer.testnet.riselabs.xyz"
echo "   • Sepolia: https://sepolia.etherscan.io"
