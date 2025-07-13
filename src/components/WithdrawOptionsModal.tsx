import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Token {
  id: string;
  name: string;
  symbol: string;
  liquidity: number;
}

interface WithdrawOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  onConnectWallet: () => void;
  onPayManually: () => void;
}

const WithdrawOptionsModal = ({ 
  isOpen, 
  onClose, 
  token, 
  onConnectWallet, 
  onPayManually 
}: WithdrawOptionsModalProps) => {
  if (!isOpen || !token) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-modal-scale border border-gray-700 transition-all duration-300">
        {/* PGPAY Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">PG</span>
            </div>
            <span className="text-white font-bold text-xl">PGPAY</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-white border-gray-600 bg-transparent hover:bg-gray-800"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Withdraw Liquidity</h3>
            <p className="text-gray-400 text-sm">
              Choose your withdrawal method for {token.liquidity.toFixed(2)} SOL from {token.name}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onConnectWallet}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg h-12 flex items-center justify-center space-x-2"
            >
              <span>Connect Wallet</span>
              <Badge 
                variant="secondary" 
                className="bg-primary text-primary-foreground text-xs px-2 py-1"
              >
                Recommended
              </Badge>
            </Button>

            <Button
              onClick={onPayManually}
              variant="outline"
              className="w-full text-white border-gray-600 bg-transparent hover:bg-gray-800 rounded-lg h-12"
            >
              Pay Manually
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-xs">
            Encrypted & Secure Payment
            <br />
            By paying you agree to our terms of service
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawOptionsModal;