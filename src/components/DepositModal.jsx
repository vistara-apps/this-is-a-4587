import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const CRYPTO_OPTIONS = [
  { symbol: 'USDC', name: 'USD Coin', apy: { 30: 6.0, 90: 8.5, 180: 10.0 } },
  { symbol: 'ETH', name: 'Ethereum', apy: { 30: 8.0, 90: 10.5, 180: 12.0 } },
];

const LOCK_PERIODS = [
  { days: 30, label: '30 Days', description: 'Short term' },
  { days: 90, label: '90 Days', description: 'Medium term' },
  { days: 180, label: '180 Days', description: 'Long term' },
];

function DepositModal({ onClose }) {
  const { createDeposit } = useApp();
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_OPTIONS[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(LOCK_PERIODS[1]);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Configure, 2: Review, 3: Processing

  const currentAPY = selectedAsset.apy[selectedPeriod.days];
  const estimatedEarnings = amount ? (parseFloat(amount) * currentAPY / 100 * selectedPeriod.days / 365) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setStep(2);
  };

  const confirmDeposit = async () => {
    setStep(3);
    setIsProcessing(true);

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      createDeposit({
        cryptoAsset: selectedAsset.symbol,
        amount: parseFloat(amount),
        lockPeriod: selectedPeriod.days,
        apy: currentAPY,
      });
      
      onClose();
    } catch (error) {
      console.error('Deposit failed:', error);
      setIsProcessing(false);
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="crypto-card rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {step === 1 && 'Create New Deposit'}
            {step === 2 && 'Review Deposit'}
            {step === 3 && 'Processing Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Select Asset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CRYPTO_OPTIONS.map((asset) => (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedAsset.symbol === asset.symbol
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-white font-semibold">{asset.symbol}</div>
                      <div className="text-blue-200 text-sm">{asset.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Amount to Deposit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 text-sm">
                    {selectedAsset.symbol}
                  </div>
                </div>
              </div>

              {/* Lock Period Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Lock Period
                </label>
                <div className="space-y-2">
                  {LOCK_PERIODS.map((period) => (
                    <button
                      key={period.days}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`w-full p-4 rounded-lg border transition-all flex items-center justify-between ${
                        selectedPeriod.days === period.days
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-white font-semibold">{period.label}</div>
                        <div className="text-blue-200 text-sm">{period.description}</div>
                      </div>
                      <div className="text-green-400 font-semibold">
                        {selectedAsset.apy[period.days]}% APY
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimation */}
              {amount && (
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Estimated Earnings</span>
                    <span className="text-green-400 font-semibold">
                      +{estimatedEarnings.toFixed(4)} {selectedAsset.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-200">Total at Maturity</span>
                    <span className="text-white font-semibold">
                      {(parseFloat(amount) + estimatedEarnings).toFixed(4)} {selectedAsset.symbol}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Deposit
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Deposit Summary */}
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3">Deposit Summary</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Asset</span>
                  <span className="text-white font-semibold">{selectedAsset.symbol}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Amount</span>
                  <span className="text-white font-semibold">{amount} {selectedAsset.symbol}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Lock Period</span>
                  <span className="text-white font-semibold">{selectedPeriod.label}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">APY</span>
                  <span className="text-green-400 font-semibold">{currentAPY}%</span>
                </div>
                
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Estimated Earnings</span>
                    <span className="text-green-400 font-semibold">
                      +{estimatedEarnings.toFixed(4)} {selectedAsset.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start space-x-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-200 text-sm">
                    Your crypto will be locked for {selectedPeriod.days} days. Early withdrawal may result in loss of accrued rewards.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={confirmDeposit}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Processing Transaction</h3>
                <p className="text-blue-200">
                  Please confirm the transaction in your wallet and wait for blockchain confirmation.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  This may take a few minutes depending on network congestion.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositModal;