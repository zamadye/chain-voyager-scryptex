
import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Wallet, LogIn } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';

interface WalletAuthModalProps {
  children: React.ReactNode;
}

export const WalletAuthModal = ({ children }: WalletAuthModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { authenticateWallet, isAuthenticated } = useSupabaseIntegration();

  const handleWalletAuth = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const message = `Authenticate with SCRYPTEX\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      
      await authenticateWallet(address, signature, message);
      toast.success('Wallet authenticated successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Wallet authentication failed:', error);
      toast.error('Failed to authenticate wallet');
    }
  };

  if (isAuthenticated) {
    return (
      <Button 
        variant="outline" 
        className="bg-green-800 border-green-700 text-white hover:bg-green-700"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connected
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Connect to SCRYPTEX
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Connect your wallet to start earning STEX points
            </p>
            <ConnectButton />
          </div>

          {isConnected && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Sign a message to authenticate your wallet
                </p>
                <Button 
                  onClick={handleWalletAuth}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign Message & Authenticate
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Start earning STEX points with wallet activities!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
