
import { useEffect } from 'react';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { useAppStore } from '@/stores/useAppStore';
import { Web3Service } from '@/lib/web3-service';
import { SUPPORTED_CHAINS } from '@/lib/chains';

export const useWeb3Status = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const balance = useBalance({ address });
  const { setWallet, setChainStatus } = useAppStore();

  // Update wallet state
  useEffect(() => {
    setWallet({
      address: address || null,
      isConnected,
      chainId: chainId || null,
      balance: balance.data ? balance.data.formatted : undefined,
    });
  }, [address, isConnected, chainId, balance.data, setWallet]);

  // Update chain status
  useEffect(() => {
    const updateChainStatus = async () => {
      const statusMap = new Map();

      for (const [key, chain] of Object.entries(SUPPORTED_CHAINS)) {
        try {
          const [gasPrice, blockHeight] = await Promise.all([
            Web3Service.getGasPrice(chain.id),
            Web3Service.getBlockNumber(chain.id),
          ]);

          statusMap.set(key, {
            chainId: chain.id,
            isActive: true,
            blockHeight,
            gasPrice: parseFloat(gasPrice).toFixed(2),
            lastUpdated: Date.now(),
            latency: Math.random() * 100 + 50, // Mock latency
          });
        } catch (error) {
          console.error(`Failed to get status for ${chain.name}:`, error);
          statusMap.set(key, {
            chainId: chain.id,
            isActive: false,
            lastUpdated: Date.now(),
          });
        }
      }

      setChainStatus(statusMap);
    };

    if (isConnected) {
      updateChainStatus();
      // Update every 30 seconds
      const interval = setInterval(updateChainStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, setChainStatus]);
};
