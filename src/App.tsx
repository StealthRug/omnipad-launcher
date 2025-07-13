
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import Index from "./pages/Index";
import CreateToken from "./pages/CreateToken";
import Liquidity from "./pages/Liquidity";
import Portfolio from "./pages/Portfolio";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";

// Default styles for wallet adapter UI
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient();

const App = () => {
  // Mainnet RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  
  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/create" element={<CreateToken />} />
                    <Route path="/liquidity" element={<Liquidity />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
};

export default App;
