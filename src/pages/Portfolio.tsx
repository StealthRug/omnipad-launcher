import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import CopyButton from '@/components/CopyButton';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import WithdrawLiquidityModal from '@/components/WithdrawLiquidityModal';
import { toast } from '@/hooks/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  imageUrl?: string;
  liquidity: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  chartData: Array<{
    time: string;
    price: number;
  }>;
  hasLiquidity: boolean;
  isDead: boolean;
  liquidityAdded?: number;
  isOverridden?: boolean;
}

// Session storage for non-persistent tokens
let sessionTokens: Token[] = [];
let updateIntervals: {
  [key: string]: NodeJS.Timeout;
} = {};
let portfolioTimer: NodeJS.Timeout | null = null;

const Portfolio = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Load tokens from session memory only (no localStorage)
  useEffect(() => {
    setTokens(sessionTokens);

    // Start update intervals for live tokens
    sessionTokens.forEach(token => {
      if (token.hasLiquidity && !token.isDead && !token.isOverridden) {
        startTokenUpdates(token.id);
      }
    });

    return () => {
      // Cleanup intervals
      Object.values(updateIntervals).forEach(clearInterval);
    };
  }, []);

  // Calculate realistic tokenomics based on liquidity
  const calculateTokenomics = (liquidity: number) => {
    // More realistic calculations based on actual liquidity pools
    const basePrice = (liquidity * 0.000001) + (Math.random() * 0.000002);
    const volume24h = liquidity * (15 + Math.random() * 10); // 15-25x liquidity is more realistic
    const marketCap = basePrice * 1000000000; // Assuming 1B supply

    return {
      price: basePrice,
      volume24h: Math.round(volume24h),
      marketCap: Math.round(marketCap)
    };
  };

  // Generate realistic active chart data with more volatility
  const generateActiveChartData = (basePrice: number, volatility: number = 0.4) => {
    const data = [];
    let currentPrice = basePrice;
    for (let i = 0; i < 24; i++) {
      // More active trading simulation
      const trendFactor = Math.sin(i * 0.4) * 0.15; // Stronger trend
      const volatilityFactor = (Math.random() - 0.5) * volatility;
      const pumpChance = Math.random();

      // More frequent pumps and dips for active feeling
      let pumpFactor = 0;
      if (pumpChance < 0.08) {
        // 8% chance of pump
        pumpFactor = 0.1 + Math.random() * 0.3;
      } else if (pumpChance < 0.16) {
        // 8% chance of dip
        pumpFactor = -(0.08 + Math.random() * 0.2);
      }
      
      // Add micro-movements for more realistic action
      const microMovement = (Math.random() - 0.5) * 0.02;
      
      currentPrice = currentPrice * (1 + trendFactor + volatilityFactor + pumpFactor + microMovement);
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: Math.max(currentPrice, basePrice * 0.05) // Allow more dramatic dips
      });
    }
    return data;
  };

  // Generate override chart data (smooth ramp + spike) with target price of 0.0000247
  const generateOverrideChartData = () => {
    const data = [];
    const basePrice = 0.00000500;
    const targetPrice = 0.0000247; // Updated to match Shift+6 price

    // Smooth ramp-up for first 16 hours
    for (let i = 0; i < 16; i++) {
      const progress = i / 15;
      const price = basePrice + progress * (targetPrice - basePrice) * 0.6;
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: price
      });
    }

    // Big green spike over 4 hours
    for (let i = 16; i < 20; i++) {
      const spikeProgress = (i - 15) / 4;
      const spikeMultiplier = 1 + spikeProgress * 1.2;
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: (basePrice + (targetPrice - basePrice) * 0.6) * spikeMultiplier
      });
    }

    // Level out at target price
    for (let i = 20; i < 24; i++) {
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: targetPrice
      });
    }
    return data;
  };

  // Generate crash chart data
  const generateCrashChartData = (basePrice: number) => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: basePrice
      });
    }
    // Dramatic crash
    for (let i = 20; i < 24; i++) {
      const crashMultiplier = Math.pow(0.1, (i - 19) / 2);
      data.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        price: basePrice * crashMultiplier
      });
    }
    return data;
  };

  // Start live updates for a token
  const startTokenUpdates = (tokenId: string) => {
    if (updateIntervals[tokenId]) return;
    updateIntervals[tokenId] = setInterval(() => {
      setTokens(prevTokens => {
        return prevTokens.map(token => {
          if (token.id === tokenId && token.hasLiquidity && !token.isDead) {
            if (token.isOverridden) {
              // Ultra-slow growth after override
              const growthRate = 1.00005; // 0.005% growth per update
              const newLiquidity = token.liquidity * growthRate;
              const newPrice = token.price * growthRate;
              const newVolume = token.volume24h * growthRate;
              const newMarketCap = token.marketCap * growthRate;
              
              return {
                ...token,
                liquidity: newLiquidity,
                price: newPrice,
                volume24h: Math.round(newVolume),
                marketCap: Math.round(newMarketCap),
                priceChange24h: token.priceChange24h + 0.001
              };
            } else {
              // Much more aggressive liquidity growth with random chunks
              const randomChunk = Math.random() * 3 + 0.5; // 0.5 to 3.5 SOL chunks
              const baseGrowthRate = 1.02 + Math.random() * 0.08; // 2-10% per update
              const newLiquidity = token.liquidity + randomChunk; // Add random chunks instead of just multiplying
              const enhancedLiquidity = newLiquidity * baseGrowthRate; // Then apply growth rate
              const newTokenomics = calculateTokenomics(enhancedLiquidity);
              const priceChange = (newTokenomics.price - token.price) / token.price * 100;
              
              return {
                ...token,
                liquidity: enhancedLiquidity,
                ...newTokenomics,
                priceChange24h: priceChange,
                chartData: generateActiveChartData(newTokenomics.price, 0.7) // Even higher volatility
              };
            }
          }
          return token;
        });
      });

      // Update session tokens
      sessionTokens = sessionTokens.map(token => {
        if (token.id === tokenId && token.hasLiquidity && !token.isDead) {
          if (token.isOverridden) {
            // Ultra-slow growth after override
            const growthRate = 1.00005;
            const newLiquidity = token.liquidity * growthRate;
            const newPrice = token.price * growthRate;
            const newVolume = token.volume24h * growthRate;
            const newMarketCap = token.marketCap * growthRate;
            
            return {
              ...token,
              liquidity: newLiquidity,
              price: newPrice,
              volume24h: Math.round(newVolume),
              marketCap: Math.round(newMarketCap),
              priceChange24h: token.priceChange24h + 0.001
            };
          } else {
            // Much more aggressive liquidity growth with random chunks
            const randomChunk = Math.random() * 3 + 0.5; // 0.5 to 3.5 SOL chunks
            const baseGrowthRate = 1.02 + Math.random() * 0.08; // 2-10% per update
            const newLiquidity = token.liquidity + randomChunk; // Add random chunks instead of just multiplying
            const enhancedLiquidity = newLiquidity * baseGrowthRate; // Then apply growth rate
            const newTokenomics = calculateTokenomics(enhancedLiquidity);
            const priceChange = (newTokenomics.price - token.price) / token.price * 100;
            
            return {
              ...token,
              liquidity: enhancedLiquidity,
              ...newTokenomics,
              priceChange24h: priceChange,
              chartData: generateActiveChartData(newTokenomics.price, 0.7) // Even higher volatility
            };
          }
        }
        return token;
      });
    }, 3000); // Update every 3 seconds
  };

  // Stop updates for a token
  const stopTokenUpdates = (tokenId: string) => {
    if (updateIntervals[tokenId]) {
      clearInterval(updateIntervals[tokenId]);
      delete updateIntervals[tokenId];
    }
  };

  // Trigger Shift+6 override with exact specified values
  const triggerShiftSixOverride = () => {
    if (tokens.length > 0) {
      const updatedTokens = tokens.map(token => ({
        ...token,
        liquidity: 43.90,
        price: 0.0000141,
        volume24h: 7760,
        marketCap: 14100,
        priceChange24h: 15.8,
        chartData: generateOverrideChartData(),
        isOverridden: true
      }));
      setTokens(updatedTokens);
      sessionTokens = updatedTokens;
      
      // Restart updates for ultra-slow growth
      updatedTokens.forEach(token => {
        if (token.hasLiquidity && !token.isDead) {
          startTokenUpdates(token.id);
        }
      });
      
      // Show toast notification
      toast({
        title: "Token reached high liquidity. Consider withdrawing."
      });
    }
  };

  // Handle Shift + 6 key combination for developer override with 5-second delay
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === '^') {
        setTimeout(() => {
          triggerShiftSixOverride();
        }, 5000);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tokens]);

  const handleWithdrawLiquidity = (token: Token) => {
    setSelectedToken(token);
    setShowWithdrawModal(true);
  };

  const handleWithdrawSuccess = (tokenId: string) => {
    // Stop updates for this token
    stopTokenUpdates(tokenId);
    const updatedTokens = tokens.map(token => {
      if (token.id === tokenId) {
        return {
          ...token,
          isDead: true,
          liquidity: 0,
          price: token.price * 0.02,
          priceChange24h: -98,
          volume24h: 0,
          marketCap: 0,
          hasLiquidity: false,
          chartData: generateCrashChartData(token.price)
        };
      }
      return token;
    });
    setTokens(updatedTokens);
    sessionTokens = updatedTokens;
  };


  // Show empty state if no tokens
  if (tokens.length === 0) {
    return <Layout>
        <div className="min-h-screen py-8 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4">
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-300">No tokens created</h3>
              <p className="text-gray-400">
                Create your first token to get started with liquidity management
              </p>
            </div>
          </div>
        </div>
      </Layout>;
  }

  return <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Portfolio</h1>
            <p className="text-xl text-gray-300">Track your token holdings and performance</p>
          </div>

          <div className="grid gap-6">
            {tokens.map(token => <div key={token.id} className={`glass rounded-2xl p-6 transition-all duration-300 ${token.isDead ? 'opacity-60' : ''} ${token.isOverridden ? 'ring-2 ring-green-500/50 high-activity-pulse' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Token Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
                      {token.imageUrl ? <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover rounded-full pointer-events-auto" style={{ pointerEvents: 'auto' }} /> : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
                          {token.symbol[0]}
                        </div>}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{token.name}</h3>
                      <p className="text-gray-400">${token.symbol}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {token.address ? <>
                            <span className="text-xs text-gray-500 font-mono">
                              {token.address.slice(0, 8)}...{token.address.slice(-8)}
                            </span>
                            <CopyButton 
                              text={token.address} 
                              size="icon"
                              className="h-6 w-6 p-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
                              toastMessage="Address copied to clipboard"
                            />
                          </> : <span className="text-xs text-gray-500">No address</span>}
                      </div>
                      <p className={`text-sm mt-1 ${token.liquidity > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                        {token.liquidity > 0 ? `${token.liquidity.toFixed(2)} SOL` : 'No liquidity'}
                      </p>
                      {token.isOverridden && <span className="text-xs font-semibold text-[#ab9864]">$1,000+ TOKEN</span>}
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={token.chartData}>
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <Line type="monotone" dataKey="price" stroke={token.isDead ? "#EF4444" : token.priceChange24h >= 0 ? "#10B981" : "#EF4444"} strokeWidth={2} dot={false} animationDuration={token.isDead ? 1000 : 300} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats & Actions */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Price</p>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold">
                            ${token.price > 0 ? token.price.toFixed(8) : '0.00000000'}
                          </span>
                          {token.hasLiquidity && !token.isDead && token.priceChange24h !== 0 && <>
                              {token.priceChange24h > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                              <span className={token.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}>
                                {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                              </span>
                            </>}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Volume 24h</p>
                        <p className="font-semibold">${token.volume24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Market Cap</p>
                        <p className="font-semibold">${token.marketCap.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Liquidity</p>
                        <p className={`font-semibold ${token.liquidity > 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                          {token.liquidity > 0 ? `${token.liquidity.toFixed(2)} SOL` : '0 SOL'}
                        </p>
                      </div>
                    </div>
                    
                    {token.hasLiquidity && !token.isDead && <Button onClick={() => handleWithdrawLiquidity(token)} variant="outline" className="w-full glass border-red-500/30 text-red-400 hover:bg-red-500/10">
                        Withdraw Liquidity
                      </Button>}
                    
                    {token.isDead && <div className="w-full text-center text-red-400 text-sm py-2">
                        Token Liquidity Withdrawn
                      </div>}
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      <WithdrawLiquidityModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} token={selectedToken} onWithdrawSuccess={handleWithdrawSuccess} />
    </Layout>;
};

// Export function to add tokens from other components
export const addTokenToSession = (token: Omit<Token, 'chartData' | 'liquidity' | 'price' | 'priceChange24h' | 'volume24h' | 'marketCap' | 'hasLiquidity' | 'isDead'>) => {
  const newToken: Token = {
    ...token,
    liquidity: 0,
    price: 0,
    priceChange24h: 0,
    volume24h: 0,
    marketCap: 0,
    hasLiquidity: false,
    isDead: false,
    chartData: Array.from({
      length: 24
    }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      price: 0
    }))
  };
  sessionTokens.push(newToken);
};

// Helper function to generate active chart data (moved here for export access)
const generateActiveChartDataHelper = (basePrice: number, volatility: number = 0.4) => {
  const data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < 24; i++) {
    // More active trading simulation
    const trendFactor = Math.sin(i * 0.4) * 0.15; // Stronger trend
    const volatilityFactor = (Math.random() - 0.5) * volatility;
    const pumpChance = Math.random();

    // More frequent pumps and dips for active feeling
    let pumpFactor = 0;
    if (pumpChance < 0.08) {
      // 8% chance of pump
      pumpFactor = 0.1 + Math.random() * 0.3;
    } else if (pumpChance < 0.16) {
      // 8% chance of dip
      pumpFactor = -(0.08 + Math.random() * 0.2);
    }
    
    // Add micro-movements for more realistic action
    const microMovement = (Math.random() - 0.5) * 0.02;
    
    currentPrice = currentPrice * (1 + trendFactor + volatilityFactor + pumpFactor + microMovement);
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      price: Math.max(currentPrice, basePrice * 0.05) // Allow more dramatic dips
    });
  }
  return data;
};

// Export function to update token with liquidity
export const updateTokenLiquidity = (tokenName: string, liquidityAmount: number) => {
  sessionTokens = sessionTokens.map(token => {
    if (token.name === tokenName) {
      // Start with the actual liquidity amount for proper display
      const tokenomics = {
        liquidity: liquidityAmount, // Use actual amount for portfolio display
        price: liquidityAmount * 0.000001 + Math.random() * 0.000005,
        volume24h: Math.round(liquidityAmount * (8 + Math.random() * 12)),
        marketCap: Math.round((liquidityAmount * 0.000001 + Math.random() * 0.000005) * 1000000000)
      };
      return {
        ...token,
        ...tokenomics,
        hasLiquidity: true,
        priceChange24h: 0,
        chartData: generateActiveChartDataHelper(tokenomics.price, 0.3), // Use realistic chart data
        liquidityAdded: liquidityAmount // Store original amount for growth calculation
      };
    }
    return token;
  });
};

export default Portfolio;
