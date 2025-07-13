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
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA4IiBoZWlnaHQ9IjEwOCIgdmlld0JveD0iMCAwIDEwOCAxMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDgiIGhlaWdodD0iMTA4IiByeD0iMjYiIGZpbGw9IiNBQjlGRjIiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00Ni41MjY3IDY5LjkyMjlDNDIuMDA1NCA3Ni44NTA5IDM0LjQyOTIgODUuNjE4MiAyNC4zNDggODUuNjE4MkMxOS41ODI0IDg1LjYxODIgMTUgODMuNjU2MyAxNSA3NS4xMzQyQzE1IDUzLjQzMDUgNDQuNjMyNiAxOS44MzI3IDcyLjEyNjggMTkuODMyN0M4Ny43NjggMTkuODMyNyA5NCAzMC42ODQ2IDk0IDQzLjAwNzlDOTQgNTguODI1OCA4My43MzU1IDc2LjkxMjIgNzMuNTMyMSA3Ni45MTIyQzcwLjI5MzkgNzYuOTEyMiA2OC43MDUzIDc1LjEzNDIgNjguNzA1MyA3Mi4zMTRDNjguNzA1MyA3MS41NzgzIDY4LjgyNzUgNzAuNzgxMiA2OS4wNzE5IDY5LjkyMjlDNjUuNTg5MyA3NS44Njk5IDU4Ljg2ODUgODEuMzg3OCA1Mi41NzU0IDgxLjM4NzhDNDcuOTkzIDgxLjM4NzggNDUuNjcxMyA3OC41MDYzIDQ1LjY3MTMgNzQuNDU5OEM0NS42NzEzIDcyLjk4ODQgNDUuOTc2OCA3MS40NTU2IDQ2LjUyNjcgNjkuOTIyOVpNODMuNjc2MSA0Mi41Nzk0QzgzLjY3NjEgNDYuMTcwNCA4MS41NTc1IDQ3Ljk2NTggNzkuMTg3NSA0Ny45NjU4Qzc2Ljc4MTYgNDcuOTY1OCA3NC42OTg5IDQ2LjE3MDQgNzQuNjk4OSA0Mi41Nzk0Qzc0LjY5ODkgMzguOTg4NSA3Ni43ODE2IDM3LjE5MzEgNzkuMTg3NSAzNy4xOTMxQzgxLjU1NzUgMzcuMTkzMSA4My42NzYxIDM4Ljk4ODUgODMuNjc2MSA0Mi41Nzk0Wk03MC4yMTAzIDQyLjU3OTVDNzAuMjEwMyA0Ni4xNzA0IDY4LjA5MTYgNDcuOTY1OCA2NS43MjE2IDQ3Ljk2NThDNjMuMzE1NyA0Ny45NjU4IDYxLjIzMyA0Ni4xNzA0IDYxLjIzMyA0Mi41Nzk1QzYxLjIzMyAzOC45ODg1IDYzLjMxNTcgMzcuMTkzMSA2NS43MjE2IDM3LjE5MzFDNjguMDkxNiAzNy4xOTMxIDcwLjIxMDMgMzguOTg4NSA3MC4yMTAzIDQyLjU3OTVaIiBmaWxsPSIjRkZGREY4Ii8+Cjwvc3ZnPgo=',
          detected: !!(window as any).phantom?.solana,
          category: 'suggested'
        },
        {
          name: 'Solflare',
          icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJTIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMwMjA1MGE7c3Ryb2tlOiNmZmVmNDY7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOi41cHg7fS5jbHMtMntmaWxsOiNmZmVmNDY7fTwvc3R5bGU+PC9kZWZzPjxyZWN0IGNsYXNzPSJjbHMtMiIgeD0iMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iMTIiIHJ5PSIxMiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTI0LjIzLDI2LjQybDIuNDYtMi4zOCw0LjU5LDEuNWMzLjAxLDEsNC41MSwyLjg0LDQuNTEsNS40MywwLDEuOTYtLjc1LDMuMjYtMi4yNSw0LjkzbC0uNDYuNS4xNy0xLjE3Yy42Ny00LjI2LS41OC02LjA5LTQuNzItNy40M2wtNC4zLTEuMzhoMFpNMTguMDUsMTEuODVsMTIuNTIsNC4xNy0yLjcxLDIuNTktNi41MS0yLjE3Yy0yLjI1LS43NS0zLjAxLTEuOTYtMy4zLTQuNTF2LS4wOGgwWk0xNy4zLDMzLjA2bDIuODQtMi43MSw1LjM0LDEuNzVjMi44LjkyLDMuNzYsMi4xMywzLjQ2LDUuMThsLTExLjY1LTQuMjJoMFpNMTMuNzEsMjAuOTVjMC0uNzkuNDItMS41NCwxLjEzLTIuMTcuNzUsMS4wOSwyLjA1LDIuMDUsNC4wOSwyLjcxbDQuNDIsMS40Ni0yLjQ2LDIuMzgtNC4zNC0xLjQyYy0yLS42Ny0yLjg0LTEuNjctMi44NC0yLjk2TTI2LjgyLDQyLjg3YzkuMTgtNi4wOSwxNC4xMS0xMC4yMywxNC4xMS0xNS4zMiwwLTMuMzgtMi01LjI2LTYuNDMtNi43MmwtMy4zNC0xLjEzLDkuMTQtOC43Ny0xLjg0LTEuOTYtMi43MSwyLjM4LTEyLjgxLTQuMjJjLTMuOTcsMS4yOS04Ljk3LDUuMDktOC45Nyw4Ljg5LDAsLjQyLjA0LjgzLjE3LDEuMjktMy4zLDEuODgtNC42MywzLjYzLTQuNjMsNS44LDAsMi4wNSwxLjA5LDQuMDksNC41NSw1LjIybDIuNzUuOTItOS41Miw5LjE0LDEuODQsMS45NiwyLjk2LTIuNzEsMTQuNzMsNS4yMmgwWiIvPjwvc3ZnPg==',
          detected: !!(window as any).solflare,
          category: 'suggested'
        },
        {
          name: 'MetaMask',
          icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' fill='none'%3e %3cg clip-path='url(%23a)'%3e %3cpath fill='%23FF5C16' d='M420.42 425.32 336 400.18l-63.66 38.06-44.42-.02-63.7-38.04-84.39 25.14-25.66-86.65 25.66-96.17-25.66-81.31L79.83 60.42l131.86 78.77h76.88l131.85-78.77 25.67 100.77-25.67 81.3 25.67 96.18z'/%3e %3cpath fill='%23FF5C16' d='m79.85 60.42 131.86 78.83-5.25 54.1L79.87 60.42Zm84.39 278.28 58.01 44.2-58.01 17.28zm53.38-73.06-11.16-72.25-71.37 49.13-.03-.02v.03l.22 50.57 28.94-27.46zm202.8-205.22-131.86 78.83 5.23 54.1zM336.04 338.7l-58.02 44.2 58.02 17.28zm29.16-96.17h.02zv-.03l-.02.01-71.37-49.12-11.15 72.25h53.38L365 293.1z'/%3e %3cpath fill='%23E34807' d='M164.22 400.18 79.83 425.3l-25.66-86.6h110.05v61.47Zm53.38-134.56 16.12 104.45-22.34-58.08-76.14-18.89 28.96-27.48zm118.44 134.56 84.38 25.13 25.67-86.6H336.04zm-53.38-134.56-16.12 104.45 22.34-58.08 76.14-18.89-28.98-27.48z'/%3e %3cpath fill='%23FF8D5D' d='m54.17 338.66 25.66-96.17h55.2l.2 50.6 76.15 18.88 22.33 58.08-11.48 12.79-58.01-44.2H54.17zm391.92 0-25.67-96.17h-55.2l-.2 50.6-76.14 18.88-22.34 58.08 11.48 12.79 58.02-44.2h110.05zM288.56 139.2H211.7l-5.23 54.1L233.71 370h32.83l27.27-176.7z'/%3e %3cpath fill='%23661800' d='M79.83 60.42 54.17 161.19l25.66 81.3h55.2l71.42-49.14L79.84 60.42ZM201.64 286.6h-25l-13.62 13.34 48.38 12-9.76-25.36zM420.42 60.42l25.67 100.77-25.67 81.3h-55.2l-71.41-49.14L420.4 60.42ZM298.65 286.6h25.04l13.62 13.36-48.43 12.02 9.77-25.4zm-26.33 117.16 5.7-20.88-11.48-12.8h-32.85l-11.48 12.8 5.7 20.88'/%3e %3cpath fill='%23C0C4CD' d='M272.32 403.76v34.5h-44.4v-34.5z'/%3e %3cpath fill='%23E7EBF6' d='m164.24 400.14 63.72 38.1v-34.5l-5.7-20.88zm171.8 0-63.72 38.1v-34.5l5.7-20.88z'/%3e %3c/g%3e %3cdefs%3e %3cclipPath id='a'%3e %3cpath fill='white' d='M0 0h500v500H0z'/%3e %3c/clipPath%3e %3c/defs%3e %3c/svg%3e",
          detected: !!(window as any).ethereum?.isMetaMask,
          category: 'suggested'
        },
        {
          name: 'WalletConnect',
          icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3e %3cradialGradient id='a' cx='0%25' cy='50%25' r='100%25'%3e %3cstop offset='0' stop-color='%235d9df6'/%3e %3cstop offset='1' stop-color='%23006fff'/%3e %3c/radialGradient%3e %3cg fill='none' fill-rule='evenodd'%3e %3cpath fill='url(%23a)' d='M256 0c141.385 0 256 114.615 256 256S397.385 512 256 512 0 397.385 0 256 114.615 0 256 0z'/%3e %3cpath fill='white' fill-rule='nonzero' d='M162.692 197.709c51.533-50.279 135.084-50.279 186.617 0l6.202 6.05a6.327 6.327 0 0 1 0 9.105l-21.216 20.7a3.357 3.357 0 0 1-4.666 0l-8.535-8.328c-35.95-35.075-94.238-35.075-130.188 0l-9.14 8.918a3.357 3.357 0 0 1-4.666 0l-21.216-20.7a6.327 6.327 0 0 1 0-9.104zm230.493 42.809 18.883 18.422a6.327 6.327 0 0 1 0 9.104l-85.142 83.07c-2.577 2.514-6.754 2.514-9.33 0l-60.43-58.957a1.679 1.679 0 0 0-2.332 0l-60.427 58.958c-2.576 2.513-6.754 2.514-9.33 0l-85.145-83.072a6.327 6.327 0 0 1 0-9.104l18.883-18.422c2.576-2.514 6.754-2.514 9.33 0l60.43 58.958a1.679 1.679 0 0 0 2.332 0l60.427-58.958c2.576-2.514 6.754-2.514 9.33 0l60.43 58.958a1.679 1.679 0 0 0 2.332 0l60.428-58.957c2.577-2.514 6.755-2.514 9.331 0z'/%3e %3c/g%3e %3c/svg%3e",
          detected: false,
          category: 'others'
        },
        {
          name: 'Coinbase Wallet',
          icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 40 40'%3e %3cpath fill='%231652F0' d='M20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20Z'/%3e %3cpath fill='white' fill-rule='evenodd' d='M5.455 20c0 8.034 6.512 14.546 14.546 14.546 8.033 0 14.545-6.512 14.545-14.545 0-8.034-6.512-14.546-14.545-14.546-8.034 0-14.546 6.512-14.546 14.546Zm11.859-4.685a2 2 0 0 0-2 2v5.373a2 2 0 0 0 2 2h5.373a2 2 0 0 0 2-2v-5.373a2 2 0 0 0-2-2h-5.373Z' clip-rule='evenodd'/%3e %3c/svg%3e",
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
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-gray-700/50 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white tracking-tight">Connect wallet</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-8">
          {/* Suggested Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              SUGGESTED
            </h4>
            <div className="space-y-3">
              {suggestedWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet)}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 bg-gray-800/60 hover:bg-gray-700/80 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/5">
                      <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
                    </div>
                    <span className="text-white font-semibold text-lg">{wallet.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {wallet.detected && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">Detected</span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Others Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              OTHERS
            </h4>
            <div className="space-y-3">
              {otherWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet)}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 bg-gray-800/60 hover:bg-gray-700/80 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/5">
                      <img src={wallet.icon} alt={wallet.name} className="w-8 h-8" />
                    </div>
                    <span className="text-white font-semibold text-lg">{wallet.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {wallet.detected && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">Detected</span>
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {isConnecting && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-3 text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              <span className="text-base font-medium">Connecting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnectModal;
