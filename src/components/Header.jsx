import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Lock, TrendingUp } from 'lucide-react';

function Header() {
  return (
    <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center glow-effect">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white">CryptoLock</h1>
              <p className="text-sm text-blue-200 hidden sm:block">Rewards</p>
            </div>
          </div>

          {/* Navigation (hidden on mobile, could be expanded) */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm">
            <a href="#dashboard" className="text-blue-200 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#earn" className="text-blue-200 hover:text-white transition-colors">
              Earn
            </a>
            <a href="#rewards" className="text-blue-200 hover:text-white transition-colors">
              Rewards
            </a>
            <a href="#about" className="text-blue-200 hover:text-white transition-colors">
              About
            </a>
          </nav>

          {/* Stats Badge */}
          <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-white">Up to 12% APY</span>
          </div>

          {/* Wallet Connection */}
          <div className="scale-90 sm:scale-100">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;