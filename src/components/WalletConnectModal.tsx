import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  liquidity: number;
}

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  onWithdrawSuccess?: (tokenId: string) => void;
}

interface WalletOption {
  name: string;
  icon: string;
  detected: boolean;
  category: 'suggested' | 'others';
}

const WalletConnectModal = ({ isOpen, onClose, token, onWithdrawSuccess }: WalletConnectModalProps) => {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Detect installed wallets
      const detectedWallets: WalletOption[] = [
        {
          name: 'Phantom',
          icon: '👻',
          detected: !!(window as any).phantom?.solana,
          category: 'suggested'
        },
        {
          name: 'Solflare',
          icon: '☀️',
          detected: !!(window as any).solflare,
          category: 'suggested'
        },
        {
          name: 'MetaMask',
          icon: '🦊',
          detected: !!(window as any).ethereum?.isMetaMask,
          category: 'suggested'
        },
        {
          name: 'WalletConnect',
          icon: '🔗',
          detected: false,
          category: 'others'
        },
        {
          name: 'Coinbase Wallet',
          icon: '🔵',
          detected: !!(window as any).ethereum?.isCoinbaseWallet,
          category: 'others'
        }
      ];
      setWallets(detectedWallets);
    }
  }, [isOpen]);

  if (!isOpen || !token) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleWalletConnect = async (wallet: WalletOption) => {
    if (!wallet.detected && wallet.category === 'suggested') {
      toast({
        title: `${wallet.name} not detected`,
        description: `Please install ${wallet.name} to connect`,
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate transaction confirmation
      toast({
        title: "Wallet Connected",
        description: `Connected to ${wallet.name} successfully`,
      });

      // Simulate withdrawal transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onWithdrawSuccess) {
        onWithdrawSuccess(token.id);
      }
      
      onClose();
      
      toast({
        title: `${token.name} Liquidity Withdrawn`,
        description: `${token.liquidity.toFixed(2)} SOL has been sent to your wallet`,
      });
      
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const suggestedWallets = wallets.filter(w => w.category === 'suggested');
  const otherWallets = wallets.filter(w => w.category === 'others');

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-modal-scale border border-gray-700 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Connect wallet</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Suggested Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              SUGGESTED
            </h4>
            <div className="space-y-2">
              {suggestedWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet)}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{wallet.icon}</span>
                    <span className="text-white font-medium">{wallet.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {wallet.detected && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-500/20 text-green-400 text-xs px-2 py-1"
                      >
                        Detected
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Others Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
              OTHERS
            </h4>
            <div className="space-y-2">
              {otherWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet)}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{wallet.icon}</span>
                    <span className="text-white font-medium">{wallet.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {wallet.detected && (
                      <Badge 
                        variant="secondary" 
                        className="bg-green-500/20 text-green-400 text-xs px-2 py-1"
                      >
                        Detected
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isConnecting && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span className="text-sm">Connecting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectModal;
