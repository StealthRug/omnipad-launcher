import { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, FileText, Upload } from 'lucide-react';
import TokenPreview from '@/components/TokenPreview';
import PaymentModal from '@/components/PaymentModal';
import SuccessModal from '@/components/SuccessModal';
import { addTokenToSession } from './Portfolio';

interface TokenData {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: string;
  description: string;
  image: File | null;
  imageUrl?: string;
  freezeAuthority: boolean;
  revokeMint: boolean;
  revokeMetadata: boolean;
  socialTags: boolean;
  telegram: string;
  website: string;
  twitter: string;
  creatorName: string;
  customCreatorAddress: boolean;
  creatorAddress: string;
}

const CreateToken = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [tokenData, setTokenData] = useState<TokenData>({
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: '6',
    description: '',
    image: null,
    imageUrl: '',
    freezeAuthority: false,
    revokeMint: false,
    revokeMetadata: false,
    socialTags: false,
    telegram: '',
    website: '',
    twitter: '',
    creatorName: '',
    customCreatorAddress: false,
    creatorAddress: '',
  });

  const updateTokenData = (field: keyof TokenData, value: any) => {
    setTokenData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setTokenData({
      name: '',
      symbol: '',
      totalSupply: '',
      decimals: '6',
      description: '',
      image: null,
      imageUrl: '',
      freezeAuthority: false,
      revokeMint: false,
      revokeMetadata: false,
      socialTags: false,
      telegram: '',
      website: '',
      twitter: '',
      creatorName: '',
      customCreatorAddress: false,
      creatorAddress: '',
    });
    setCurrentStep(1);
  };

  // Form validation for Step 1
  const isStep1Valid = () => {
    return (
      tokenData.name.length >= 2 &&
      tokenData.symbol.length >= 2 &&
      tokenData.totalSupply.length > 0 &&
      /^\d+$/.test(tokenData.totalSupply) // Only numbers allowed
    );
  };

  const handleImageUpload = (file: File) => {
    setImageUploading(true);
    setUploadProgress(0);
    updateTokenData('image', file);
    
    // Simulate realistic upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(uploadInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 120);
    
    // Convert to base64 for persistent storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      // Finish upload progress
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          updateTokenData('imageUrl', base64);
          setImageUploading(false);
          setUploadProgress(0);
        }, 300);
      }, 800 + Math.random() * 500);
    };
    reader.readAsDataURL(file);
  };

  const calculatePrice = () => {
    let price = 0.1;
    if (tokenData.freezeAuthority) price += 0.1;
    if (tokenData.revokeMint) price += 0.1;
    if (tokenData.revokeMetadata) price += 0.1;
    if (tokenData.socialTags) price += 0.1;
    if (tokenData.customCreatorAddress) price += 0.15;
    return price;
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
    
    // Generate a random token address ending with .omni
    const generateTokenAddress = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      // Generate 39 random characters, then append ".omni" for total of 44
      for (let i = 0; i < 39; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result + '.omni';
    };

    const tokenAddress = generateTokenAddress();
    
    // Add token to session portfolio immediately
    addTokenToSession({
      id: Date.now().toString(),
      name: tokenData.name,
      symbol: tokenData.symbol,
      address: tokenAddress,
      imageUrl: tokenData.imageUrl,
    });
    
    const existingTokens = JSON.parse(localStorage.getItem('createdTokens') || '[]');
    const newToken = {
      ...tokenData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      liquidity: 0,
      address: tokenAddress
    };
    existingTokens.push(newToken);
    localStorage.setItem('createdTokens', JSON.stringify(existingTokens));
    localStorage.setItem('lastCreatedToken', JSON.stringify(newToken));
  };

  const steps = [
    'Basic Info',
    'Icon & Description',
    'Advanced Settings',
    'Review & Create'
  ];

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center ${
                    index <= currentStep - 1 ? 'text-blue-500' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                      index <= currentStep - 1
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-600 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:block">{step}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form Section */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">
                Step {currentStep}: {steps[currentStep - 1]}
              </h2>

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Token Name</Label>
                    <Input
                      id="name"
                      value={tokenData.name}
                      onChange={(e) => updateTokenData('name', e.target.value)}
                      placeholder="My Awesome Token"
                      className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                      maxLength={25}
                    />
                    {tokenData.name.length > 0 && tokenData.name.length < 2 && (
                      <p className="text-red-400 text-sm mt-1">Minimum 2 characters required</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={tokenData.symbol}
                      onChange={(e) => updateTokenData('symbol', e.target.value.toUpperCase())}
                      placeholder="MAT"
                      className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                      maxLength={8}
                    />
                    {tokenData.symbol.length > 0 && tokenData.symbol.length < 2 && (
                      <p className="text-red-400 text-sm mt-1">Minimum 2 characters required</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="supply">Total Supply</Label>
                    <Input
                      id="supply"
                      type="text"
                      value={tokenData.totalSupply}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^[\d.]+$/.test(value)) {
                          if (value.length <= 18) {
                            updateTokenData('totalSupply', value);
                          }
                        }
                      }}
                      placeholder="1000000"
                      className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                    />
                    {tokenData.totalSupply.length > 0 && !/^\d+$/.test(tokenData.totalSupply) && (
                      <p className="text-red-400 text-sm mt-1">Numbers only</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="decimals">Decimals</Label>
                    <Select value={tokenData.decimals} onValueChange={(value) => updateTokenData('decimals', value)}>
                      <SelectTrigger className="mt-2 bg-card border-border text-card-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground z-50">
                        {[...Array(10)].map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i} decimals
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Icon & Description */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>Token Icon</Label>
                    <div className="mt-2 bg-card border-border border-2 border-dashed rounded-xl p-8 text-center relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="icon-upload"
                      />
                      <label htmlFor="icon-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <div className="relative mb-3">
                            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                            </svg>
                            <Upload className="w-4 h-4 text-blue-400 absolute -bottom-1 -right-1 bg-gray-800 rounded-full p-1" />
                          </div>
                          <p className="text-sm text-gray-300">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                      </label>
                      
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                          <div className="w-full max-w-xs">
                            <div className="bg-gray-700 rounded-full h-3 mb-3">
                              <div 
                                className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-sm text-white text-center">
                              Uploading... {Math.round(uploadProgress)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={tokenData.description}
                      onChange={(e) => updateTokenData('description', e.target.value)}
                      placeholder="Describe your token project..."
                      className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary min-h-32 resize-none"
                      maxLength={500}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-card-foreground flex items-center gap-2">
                          Social Tags
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">+0.1 SOL</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Add social links and creator info</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tokenData.socialTags}
                        onChange={(e) => updateTokenData('socialTags', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  {tokenData.socialTags && (
                    <div className="space-y-4 p-4 bg-card/50 border border-border rounded-xl">
                      <div>
                        <Label htmlFor="telegram">Telegram</Label>
                        <Input
                          id="telegram"
                          value={tokenData.telegram}
                          onChange={(e) => updateTokenData('telegram', e.target.value)}
                          placeholder="@yourtelegram"
                          className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={tokenData.website}
                          onChange={(e) => updateTokenData('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          value={tokenData.twitter}
                          onChange={(e) => updateTokenData('twitter', e.target.value)}
                          placeholder="@yourtwitter"
                          className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="creatorName">Creator Name</Label>
                        <Input
                          id="creatorName"
                          value={tokenData.creatorName}
                          onChange={(e) => updateTokenData('creatorName', e.target.value)}
                          placeholder="Your name or team name"
                          className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Advanced Settings */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-blue-400">{calculatePrice().toFixed(1)} SOL</div>
                    <div className="text-gray-400 text-sm">Total Cost</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground flex items-center gap-2">
                            Freeze Authority
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">+0.1 SOL</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Optional security feature</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tokenData.freezeAuthority}
                          onChange={(e) => updateTokenData('freezeAuthority', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Lock className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground flex items-center gap-2">
                            Revoke Mint Authority
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">+0.1 SOL</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Optional security feature</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tokenData.revokeMint}
                          onChange={(e) => updateTokenData('revokeMint', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground flex items-center gap-2">
                            Revoke Metadata Authority
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">+0.1 SOL</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Optional security feature</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tokenData.revokeMetadata}
                          onChange={(e) => updateTokenData('revokeMetadata', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground flex items-center gap-2">
                            Custom Creator Address
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">+0.15 SOL</span>
                          </div>
                          <div className="text-sm text-muted-foreground">Customize who created the token</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tokenData.customCreatorAddress}
                          onChange={(e) => updateTokenData('customCreatorAddress', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                      </label>
                    </div>

                    {tokenData.customCreatorAddress && (
                      <div className="p-4 bg-card/50 border border-border rounded-xl">
                        <Label htmlFor="creatorAddress">Creator Address</Label>
                        <Input
                          id="creatorAddress"
                          value={tokenData.creatorAddress}
                          onChange={(e) => updateTokenData('creatorAddress', e.target.value)}
                          placeholder="Enter Solana wallet address"
                          className="mt-2 bg-card border-border text-card-foreground placeholder:text-muted-foreground focus:border-primary"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="text-lg font-semibold mb-2 text-card-foreground">Price Breakdown</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Base Token Creation</span>
                        <span>0.1 SOL</span>
                      </div>
                      {tokenData.freezeAuthority && (
                        <div className="flex justify-between">
                          <span>Freeze Authority</span>
                          <span>+0.1 SOL</span>
                        </div>
                      )}
                      {tokenData.revokeMint && (
                        <div className="flex justify-between">
                          <span>Revoke Mint Authority</span>
                          <span>+0.1 SOL</span>
                        </div>
                      )}
                      {tokenData.socialTags && (
                        <div className="flex justify-between">
                          <span>Social Tags</span>
                          <span>+0.1 SOL</span>
                        </div>
                      )}
                      {tokenData.customCreatorAddress && (
                        <div className="flex justify-between">
                          <span>Custom Creator Address</span>
                          <span>+0.15 SOL</span>
                        </div>
                      )}
                      <div className="border-t border-white/20 pt-2 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-blue-500">{calculatePrice().toFixed(1)} SOL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-card-foreground">Review Your Token</h3>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-card-foreground">{tokenData.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Symbol:</span>
                        <span className="text-card-foreground">{tokenData.symbol || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Supply:</span>
                        <span className="text-card-foreground">{tokenData.totalSupply ? Number(tokenData.totalSupply).toLocaleString() : 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Decimals:</span>
                        <span className="text-card-foreground">{tokenData.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Security Features:</span>
                        <span className="text-right text-card-foreground">
                          {[
                            tokenData.freezeAuthority && 'Freeze Authority',
                            tokenData.revokeMint && 'Revoke Mint',
                            tokenData.revokeMetadata && 'Revoke Metadata'
                          ].filter(Boolean).join(', ') || 'None selected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-3 border-t border-border">
                        <span className="text-card-foreground">Total Cost:</span>
                        <span className="text-blue-400">{calculatePrice().toFixed(1)} SOL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="bg-card border-border text-card-foreground hover:bg-accent"
                >
                  Previous
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={() => {
                      setStepLoading(true);
                      const loadingTime = currentStep === 1 ? 1200 + Math.random() * 600 : 800 + Math.random() * 400;
                      setTimeout(() => {
                        setCurrentStep(Math.min(4, currentStep + 1));
                        setStepLoading(false);
                      }, loadingTime);
                    }}
                    disabled={(currentStep === 1 && !isStep1Valid()) || stepLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {stepLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      'Next'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Create Token
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:sticky lg:top-24 h-fit">
              <TokenPreview tokenData={tokenData} />
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={calculatePrice()}
        type="token"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          resetForm();
        }}
        tokenData={tokenData}
        onCreateAnother={() => {
          setShowSuccessModal(false);
          resetForm();
        }}
      />
    </Layout>
  );
};

export default CreateToken;
