import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, Wallet, ExternalLink, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

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
  onWalletConnected?: (walletName: string) => void;
}

const WalletConnectModal = ({ isOpen, onClose, token, onWalletConnected }: WalletConnectModalProps) => {
  const { connection } = useConnection();
  const { 
    publicKey, 
    connected, 
    connecting, 
    disconnect, 
    wallets, 
    select, 
    connect,
    wallet
  } = useWallet();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      setLoadingBalance(true);
      connection.getBalance(publicKey)
        .then(balance => {
          setBalance(balance / LAMPORTS_PER_SOL);
        })
        .catch(error => {
          console.error('Error fetching balance:', error);
          toast({
            title: "Balance Error",
            description: "Failed to fetch wallet balance",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoadingBalance(false);
        });
    }
  }, [connected, publicKey, connection]);

  // Handle wallet connection
  const handleWalletSelect = async (walletName: string) => {
    try {
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (selectedWallet) {
        select(selectedWallet.adapter.name);
        await connect();
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${walletName} successfully`,
        });

        if (onWalletConnected) {
          onWalletConnected(walletName);
        }
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setBalance(null);
      toast({
        title: "Wallet Disconnected",
        description: "Wallet disconnected successfully",
      });
    } catch (error: any) {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter wallets to show only Solana-compatible ones
  const availableWallets = wallets.filter(wallet => 
    ['Phantom', 'Solflare', 'Sollet', 'Coin98'].includes(wallet.adapter.name)
  );

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-border transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            {connected ? 'Wallet Connected' : 'Connect Wallet'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-xl p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Connected State */}
        {connected && publicKey ? (
          <div className="space-y-6">
            {/* Wallet Info */}
            <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{wallet?.adapter.name}</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              
              {/* Address */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Address:</p>
                <div className="flex items-center space-x-2 bg-background rounded-lg p-3">
                  <code className="text-xs text-muted-foreground flex-1 truncate">
                    {publicKey.toString()}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copyAddress}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Balance:</p>
                <div className="bg-background rounded-lg p-3">
                  {loadingBalance ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-lg font-semibold text-foreground">
                      {balance?.toFixed(4) || '0.0000'} SOL
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              
              <Button
                onClick={handleDisconnect}
                variant="destructive"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        ) : (
          /* Connection State */
          <div className="space-y-6">
            {/* Network Info */}
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-primary">Solana Mainnet</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Connect your Solana wallet to continue
              </p>
            </div>

            {/* Available Wallets */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Available Wallets
              </h4>
              
              {availableWallets.length > 0 ? (
                <div className="space-y-3">
                  {availableWallets.map((walletAdapter) => (
                    <button
                      key={walletAdapter.adapter.name}
                      onClick={() => handleWalletSelect(walletAdapter.adapter.name)}
                      disabled={connecting}
                      className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted/80 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-background">
                          <img 
                            src={walletAdapter.adapter.icon} 
                            alt={walletAdapter.adapter.name} 
                            className="w-8 h-8" 
                          />
                        </div>
                        <span className="text-foreground font-semibold text-lg">
                          {walletAdapter.adapter.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {walletAdapter.readyState === 'Installed' && (
                          <Badge variant="secondary" className="text-xs">
                            Installed
                          </Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Fallback Wallet Button */
                <div className="space-y-3">
                  <WalletMultiButton className="w-full !bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-2xl !p-4 !text-lg !font-semibold" />
                  <p className="text-xs text-muted-foreground text-center">
                    Install a Solana wallet to connect
                  </p>
                </div>
              )}
            </div>

            {connecting && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 text-muted-foreground">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="text-base font-medium">Connecting...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectModal;