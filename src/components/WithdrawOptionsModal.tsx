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
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-700/50 transition-all duration-300 transform scale-100">
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Withdraw Liquidity</h3>
            <p className="text-gray-400 text-base leading-relaxed">
              Choose your withdrawal method for <span className="text-green-400 font-semibold">{token.liquidity.toFixed(2)} SOL</span> from <span className="text-white font-medium">{token.name}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onConnectWallet}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-2xl h-14 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Connect Wallet</span>
              <Badge 
                variant="secondary" 
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md"
              >
                Recommended
              </Badge>
            </Button>

            <Button
              onClick={onPayManually}
              variant="outline"
              className="w-full text-white border-gray-600 bg-gray-800/30 hover:bg-gray-700/50 rounded-2xl h-14 font-semibold transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay Manually
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Encrypted & Secure Payment</span>
            </div>
            <p className="text-gray-600 text-xs">
              By paying you agree to our terms of service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawOptionsModal;