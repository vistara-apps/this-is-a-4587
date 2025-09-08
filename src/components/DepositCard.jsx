import React from 'react';
import { useApp } from '../context/AppContext';
import { Clock, TrendingUp, Calendar, DollarSign } from 'lucide-react';

function DepositCard({ deposit }) {
  const { claimDeposit } = useApp();
  
  const isMatured = new Date() >= new Date(deposit.endDate);
  const daysRemaining = Math.max(0, Math.ceil((new Date(deposit.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, ((new Date() - new Date(deposit.startDate)) / (new Date(deposit.endDate) - new Date(deposit.startDate))) * 100);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAssetIcon = (asset) => {
    const icons = {
      'USDC': '💵',
      'ETH': '⚡',
      'BTC': '₿'
    };
    return icons[asset] || '🔗';
  };

  const handleClaim = () => {
    if (isMatured && deposit.status === 'active') {
      claimDeposit(deposit.depositId);
    }
  };

  return (
    <div className="crypto-card rounded-lg p-6 hover:glow-effect transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getAssetIcon(deposit.cryptoAsset)}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {deposit.amount} {deposit.cryptoAsset}
            </h3>
            <p className="text-blue-200 text-sm">{deposit.lockPeriod} days lock</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          deposit.status === 'active' 
            ? isMatured 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {deposit.status === 'active' 
            ? isMatured ? 'Ready to Claim' : 'Active'
            : 'Completed'
          }
        </div>
      </div>

      {/* Progress Bar */}
      {deposit.status === 'active' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-200">Progress</span>
            <span className="text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-blue-200 text-sm">APY</span>
          </div>
          <div className="text-white font-semibold">{deposit.apy}%</div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-blue-200 text-sm">Earned</span>
          </div>
          <div className="text-green-400 font-semibold">
            +{deposit.earned.toFixed(4)}
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 text-sm">Start Date</span>
          </div>
          <div className="text-white text-sm">{formatDate(deposit.startDate)}</div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 text-sm">
              {deposit.status === 'active' ? 'Days Left' : 'Completed'}
            </span>
          </div>
          <div className="text-white text-sm">
            {deposit.status === 'active' 
              ? isMatured ? 'Matured' : `${daysRemaining} days`
              : formatDate(deposit.endDate)
            }
          </div>
        </div>
      </div>

      {/* Action Button */}
      {deposit.status === 'active' && (
        <button
          onClick={handleClaim}
          disabled={!isMatured}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
            isMatured
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 glow-effect'
              : 'bg-white/10 text-blue-200 cursor-not-allowed'
          }`}
        >
          {isMatured ? 'Claim Rewards' : `${daysRemaining} days remaining`}
        </button>
      )}

      {deposit.status === 'completed' && (
        <div className="w-full py-3 rounded-lg bg-green-500/20 text-green-400 text-center font-semibold border border-green-500/30">
          ✓ Successfully Claimed
        </div>
      )}
    </div>
  );
}

export default DepositCard;