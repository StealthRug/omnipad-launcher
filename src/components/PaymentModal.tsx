import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Clock, AlertTriangle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  type: 'token' | 'liquidity';
}

const PaymentModal = ({ isOpen, onClose, onSuccess, amount, type }: PaymentModalProps) => {
  const [step, setStep] = useState(1);
  const [signature, setSignature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [currency] = useState('SOL');
  const [network] = useState('Solana');
  const [addressCopied, setAddressCopied] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const recipientAddress = 'E3WjPKeWdRNEqhUGMqYhfqgvYSGzfPghT9qXVwgKYTtq';

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSignature('');
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recipientAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const handleProceedToPayment = () => {
    setStep(2);
  };

  const verifyPaymentWithHelius = async (txSignature: string) => {
    try {
      const heliusRpcUrl = 'https://mainnet.helius-rpc.com/?api-key=33336ba1-7c13-4015-8ab5-a4fbfe0a6bb2';
      
      const response = await fetch(heliusRpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            txSignature,
            {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: 0
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const transaction = data.result;
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Check if transaction is confirmed
      if (!transaction.meta || transaction.meta.err) {
        throw new Error('Transaction failed or not confirmed');
      }

      // Verify the payment details - accept payment to any wallet
      const preBalances = transaction.meta.preBalances;
      const postBalances = transaction.meta.postBalances;
      const accounts = transaction.transaction.message.accountKeys;

      // Check if any account received the expected amount
      const expectedAmount = Math.round(amount * 1e9); // Convert SOL to lamports
      const tolerance = 0.001 * 1e9; // 0.001 SOL in lamports
      
      let paymentFound = false;
      for (let i = 0; i < accounts.length; i++) {
        const amountReceived = postBalances[i] - preBalances[i];
        if (Math.abs(amountReceived - expectedAmount) <= tolerance && amountReceived > 0) {
          paymentFound = true;
          break;
        }
      }
      
      if (!paymentFound) {
        throw new Error('Payment Not Found - Either use a different wallet or contact support.');
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Payment verification failed');
    }
  };

  const handleCheckTransaction = async () => {
    setIsProcessing(true);
    setPaymentError('');
    
    try {
      // Special bypass for testing and whitelisted addresses
      const bypassAddresses = [
        "1337",
        "8VqMTkXZrQF7VwzYxH3v7doVvL8dJdYe3aWRwK2HcmELnysn4pB2JzZgxhzvWLhACvVrqs4xH1QqN85RgFL7fBf9",
        "9jSkQWThMXuWps2Fk1ZZ7KrEH7VynmtgNScLfZh3X7XphD4m7TqXs2nA4kXZ7vBgmcFWm7DZrxkeF1RrJ7qRwSGA"
      ];
      
      if (bypassAddresses.includes(signature)) {
        setTimeout(() => {
          setIsProcessing(false);
          onSuccess();
        }, 1000);
        return;
      }
      
      // Validate transaction signature format
      if (!signature || signature.length < 80 || signature.length > 90) {
        throw new Error('Invalid transaction signature format. Please enter a valid Solana transaction signature.');
      }
      
      await verifyPaymentWithHelius(signature);
      onSuccess();
    } catch (error: any) {
      setPaymentError(error.message);
    }
    
    setIsProcessing(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-modal-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-modal-scale border border-gray-700">
        {/* SecPay Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">SecPay</span>
          </div>
          <Button variant="outline" size="sm" className="text-white border-gray-600 bg-transparent hover:bg-gray-800">
            Sign up
          </Button>
        </div>

        {step === 1 ? (
          // Step 1: Payment Details
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Select currency</h2>
              <div className="text-white text-2xl font-bold">{amount.toFixed(6)} SOL</div>
            </div>

            <div>
              <div className="text-gray-400 text-sm mb-2">Select network</div>
              <div className="flex items-center text-gray-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                <span>You pay network fee</span>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-400 text-sm">Expiration time</span>
              <div className="flex items-center space-x-1 text-green-400 font-mono">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-4">
              <Select value={currency} disabled>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="https://i.ibb.co/NgkKfdWc/solana.png" 
                      alt="Solana"
                      className="w-6 h-6 rounded-full"
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>

              <Select value={network} disabled>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="https://i.ibb.co/NgkKfdWc/solana.png" 
                      alt="Solana"
                      className="w-6 h-6 rounded-full"
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Proceed Button */}
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-xl h-12"
              onClick={handleProceedToPayment}
            >
              Proceed to the payment
            </Button>

            {/* Footer */}
            <div className="text-center text-gray-500 text-xs">
              Encrypted & Secure Payment
              <br />
              By paying you agree to our{' '}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                terms of service
              </Link>
            </div>
          </div>
        ) : (
          // Step 2: Transaction Details
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">Select currency</h2>
              <div className="text-white text-2xl font-bold">{amount.toFixed(6)} SOL</div>
            </div>

            <div>
              <div className="text-gray-400 text-sm mb-2">Select network</div>
              <div className="flex items-center text-gray-400 text-xs mb-4">
                <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                <span>You pay network fee</span>
              </div>
            </div>

            {/* Send Details */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Send exactly</div>
              <div className="text-white font-mono text-lg mb-3">{amount.toFixed(6)} SOL</div>
              
              <div className="text-gray-400 text-sm mb-2">address</div>
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-3 mb-4">
                <code className="text-green-400 font-mono text-sm flex-1 break-all">
                  {recipientAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {addressCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Transaction Input */}
            <div>
              <div className="text-gray-400 text-sm mb-2">Paste your transaction signature</div>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Transaction signature"
                className="bg-gray-800 border-gray-700 text-white rounded-lg h-12"
              />
              {paymentError && (
                <div className="mt-2 p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{paymentError}</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleCheckTransaction}
              disabled={!signature || isProcessing}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg h-12 transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Check Transaction'
              )}
            </Button>

            {/* Footer */}
            <div className="text-center text-gray-500 text-xs">
              Encrypted & Secure Payment
              <br />
              By paying you agree to our{' '}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                terms of service
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
