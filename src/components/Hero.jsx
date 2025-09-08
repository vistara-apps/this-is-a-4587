import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Lock, Shield, TrendingUp, Clock, ArrowRight } from 'lucide-react';

function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main Hero Content */}
        <div className="mb-8 sm:mb-12">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 sm:mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-200">Secure & Transparent</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Lock your crypto,<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              unlock predictable rewards
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-blue-200 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Securely earn interest on your idle cryptocurrency with fixed APY rates. 
            No impermanent loss, no complex DeFi risks - just predictable returns.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-16">
            <div className="scale-110">
              <ConnectButton />
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <span className="text-sm">No fees to connect</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="crypto-card rounded-lg p-6 sm:p-8 text-center hover:glow-effect transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Secure Locking</h3>
            <p className="text-blue-200 text-sm sm:text-base">
              Your crypto is locked in audited smart contracts. Full control of your private keys.
            </p>
          </div>

          <div className="crypto-card rounded-lg p-6 sm:p-8 text-center hover:glow-effect transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Fixed APY</h3>
            <p className="text-blue-200 text-sm sm:text-base">
              Earn up to 12% APY with transparent, predictable returns. No hidden fees or surprises.
            </p>
          </div>

          <div className="crypto-card rounded-lg p-6 sm:p-8 text-center hover:glow-effect transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Flexible Terms</h3>
            <p className="text-blue-200 text-sm sm:text-base">
              Choose lock periods from 30 to 180 days. Higher APY for longer commitments.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="crypto-card rounded-lg p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$2.4M+</div>
              <div className="text-blue-200 text-sm">Total Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">12%</div>
              <div className="text-blue-200 text-sm">Max APY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">1,200+</div>
              <div className="text-blue-200 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2">$180K+</div>
              <div className="text-blue-200 text-sm">Rewards Paid</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;