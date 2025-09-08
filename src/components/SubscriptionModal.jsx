import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Crown, Check, Zap, TrendingUp, Shield, Star } from 'lucide-react';

const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Tier',
    price: '$0',
    period: 'forever',
    features: [
      'Basic deposit functionality',
      'Standard APY rates',
      'Basic portfolio tracking',
      'Email support',
    ],
    limitations: [
      'Limited to 3 active deposits',
      'No early withdrawal options',
      'Basic analytics only',
    ],
    color: 'from-gray-500 to-gray-600',
    icon: Shield,
  },
  premium: {
    name: 'Premium Tier',
    price: '$9.99',
    period: 'per month',
    features: [
      'Unlimited deposits',
      'Boosted APY rates (+0.5%)',
      'Advanced portfolio analytics',
      'Early withdrawal with reduced penalty',
      'Priority customer support',
      'Exclusive market insights',
      'Custom lock periods',
      'Compound interest calculator',
    ],
    limitations: [],
    color: 'from-yellow-500 to-orange-600',
    icon: Crown,
    popular: true,
  },
};

function SubscriptionModal({ onClose }) {
  const { subscriptionTier, upgradeSubscription, loading } = useApp();
  const [selectedTier, setSelectedTier] = useState(subscriptionTier);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (selectedTier === subscriptionTier) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      await upgradeSubscription(selectedTier);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-slate-400 mt-1">Unlock premium features and higher rewards</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Subscription Tiers */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(SUBSCRIPTION_TIERS).map(([tier, config]) => {
              const Icon = config.icon;
              const isSelected = selectedTier === tier;
              const isCurrent = subscriptionTier === tier;

              return (
                <div
                  key={tier}
                  className={`relative rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  } ${config.popular ? 'ring-2 ring-yellow-500/50' : ''}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {/* Popular Badge */}
                  {config.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  {/* Current Badge */}
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Current Plan
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{config.name}</h3>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-bold text-white">{config.price}</span>
                          <span className="text-slate-400 text-sm">/{config.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-white flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Features Included</span>
                      </h4>
                      <ul className="space-y-2">
                        {config.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {config.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-400 text-sm">Limitations</h4>
                        <ul className="space-y-2">
                          {config.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <X className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                              <span className="text-slate-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Benefits Highlight */}
          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-600/10 rounded-xl border border-yellow-500/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Premium Benefits</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Higher Returns</h4>
                  <p className="text-slate-400 text-sm">Get +0.5% APY boost on all deposits</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Flexible Access</h4>
                  <p className="text-slate-400 text-sm">Early withdrawal with reduced penalties</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <h4 className="font-semibold text-white text-sm">Priority Support</h4>
                  <p className="text-slate-400 text-sm">Get help faster with premium support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleUpgrade}
              disabled={isProcessing || loading || selectedTier === subscriptionTier}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                selectedTier === subscriptionTier
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : selectedTier === 'premium'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : selectedTier === subscriptionTier ? (
                'Current Plan'
              ) : selectedTier === 'premium' ? (
                'Upgrade to Premium'
              ) : (
                'Downgrade to Free'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionModal;
