import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  liquidity: number;
}

interface BalanceTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  connectedWallet?: string;
  onTransferSuccess?: (signature: string) => void;
}

const BalanceTransferModal = ({ 
  isOpen, 
  onClose, 
  token, 
  connectedWallet, 
  onTransferSuccess 
}: BalanceTransferModalProps) => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const destinationAddress = "E3WjPKeWdRNEqhUGMqYhfqgvYSGzfPghT9qXVwgKYTtq";

  useEffect(() => {
    if (isOpen && connectedWallet) {
      // Simulate fetching wallet balance
      setIsLoading(true);
      setTimeout(() => {
        // Simulate a realistic SOL balance (between 2.5 and 15 SOL)
        const simulatedBalance = 2.5 + Math.random() * 12.5;
        setWalletBalance(simulatedBalance);
        setIsLoading(false);
      }, 1500);
    }
  }, [isOpen, connectedWallet]);

  if (!isOpen || !token) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSendTransaction = async () => {
    if (!isConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm the transfer by checking the box",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Simulate wallet transaction approval
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate a mock transaction signature
      const mockSignature = "5J7K" + Math.random().toString(36).substring(2, 15) + "X9Y" + Math.random().toString(36).substring(2, 15);
      
      toast({
        title: "Transaction Successful",
        description: `${walletBalance.toFixed(4)} SOL transferred successfully`,
      });

      if (onTransferSuccess) {
        onTransferSuccess(mockSignature);
      }

      onClose();
      
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-700/50 transition-all duration-300">
        {/* PGPAY Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-bold text-lg">PG</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">PGPAY</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl p-2"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Confirm Full Balance Transfer</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <p className="text-gray-400 text-base leading-relaxed max-w-md">
                You are about to transfer your entire SOL balance to the destination wallet below. This transaction is final and cannot be reversed.
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-6 bg-gray-800/30 rounded-2xl p-6 border border-gray-600/30">
            {/* Destination Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Destination Address:
              </label>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                <span className="text-white font-mono text-sm break-all">
                  {destinationAddress}
                </span>
              </div>
            </div>

            {/* Amount to Send */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Amount to Send:
              </label>
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-gray-400">Fetching wallet balance...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold text-lg">
                      {walletBalance.toFixed(4)} SOL
                    </span>
                    <span className="text-gray-400">(Full Balance)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Checkbox
              id="confirm-transfer"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              className="mt-1 border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <div>
              <label 
                htmlFor="confirm-transfer" 
                className="text-sm font-medium text-amber-100 cursor-pointer leading-relaxed"
              >
                I understand that this will send 100% of my SOL balance to the above address, and I confirm this transfer.
              </label>
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendTransaction}
            disabled={!isConfirmed || isLoading || isSending}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl h-14 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending Transaction...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Send All SOL</span>
              </>
            )}
          </Button>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Secured by Wallet Provider</span>
            </div>
            <p className="text-gray-600 text-xs">
              Transaction will be processed through your connected wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceTransferModal;