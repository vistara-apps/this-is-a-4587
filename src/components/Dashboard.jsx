import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, TrendingUp, Clock, DollarSign, BarChart3 } from 'lucide-react';
import PortfolioChart from './PortfolioChart';
import DepositCard from './DepositCard';
import StatsCard from './StatsCard';
import SubscriptionModal from './SubscriptionModal';

function Dashboard({ onDeposit }) {
  const { deposits, totalLocked, totalEarned, subscriptionTier } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const activeDeposits = deposits.filter(d => d.status === 'active');
  const completedDeposits = deposits.filter(d => d.status === 'completed');

  const chartData = [
    { month: 'Jan', locked: 800, earned: 12 },
    { month: 'Feb', locked: 1200, earned: 28 },
    { month: 'Mar', locked: 1500, earned: 45 },
    { month: 'Apr', locked: 1800, earned: 68 },
    { month: 'May', locked: 2100, earned: 95 },
    { month: 'Jun', locked: 2400, earned: 125 },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-blue-200">Manage your crypto deposits and track earnings</p>
          </div>
          
          <button
            onClick={onDeposit}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 glow-effect"
          >
            <Plus className="w-5 h-5" />
            <span>New Deposit</span>
          </button>
        </div>

        {/* Subscription Tier Badge */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/30">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-300 text-sm font-medium">
              {subscriptionTier === 'free' ? 'Free Tier' : 'Premium Tier'}
            </span>
            {subscriptionTier === 'free' && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="text-yellow-300 hover:text-yellow-200 text-sm font-medium transition-colors ml-2"
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Locked"
            value={`$${totalLocked.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            trend="+12.5%"
            trendUp={true}
          />
          <StatsCard
            title="Total Earned"
            value={`$${totalEarned.toLocaleString()}`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend="+8.2%"
            trendUp={true}
          />
          <StatsCard
            title="Active Deposits"
            value={activeDeposits.length}
            icon={<Clock className="w-5 h-5" />}
            trend={`${completedDeposits.length} completed`}
          />
          <StatsCard
            title="Avg APY"
            value="9.2%"
            icon={<BarChart3 className="w-5 h-5" />}
            trend="Current rate"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Portfolio Chart */}
          <div className="lg:col-span-2">
            <div className="crypto-card rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-white">Portfolio Growth</h2>
                <div className="flex space-x-2">
                  {['1M', '3M', '6M', '1Y'].map((period) => (
                    <button
                      key={period}
                      className="px-3 py-1 text-sm rounded-md bg-white/10 text-blue-200 hover:bg-white/20 transition-colors"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <PortfolioChart data={chartData} />
            </div>
          </div>

          {/* Quick Actions & Summary */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="crypto-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">USDC Deposit</p>
                      <p className="text-blue-200 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">+$1,000</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Rewards Earned</p>
                      <p className="text-blue-200 text-xs">1 day ago</p>
                    </div>
                  </div>
                  <span className="text-blue-400 text-sm">+$21.25</span>
                </div>
              </div>
            </div>

            {/* APY Rates */}
            <div className="crypto-card rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Current APY Rates</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      E
                    </div>
                    <span className="text-white text-sm">ETH</span>
                  </div>
                  <span className="text-green-400 font-semibold">12.0%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      U
                    </div>
                    <span className="text-white text-sm">USDC</span>
                  </div>
                  <span className="text-green-400 font-semibold">8.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deposits Section */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Your Deposits</h2>
            
            {/* Tab Navigation */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Active ({activeDeposits.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-white/20 text-white'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Completed ({completedDeposits.length})
              </button>
            </div>
          </div>

          {/* Deposits Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(activeTab === 'overview' ? activeDeposits : completedDeposits).map((deposit) => (
              <DepositCard key={deposit.depositId} deposit={deposit} />
            ))}
          </div>

          {/* Empty State */}
          {(activeTab === 'overview' ? activeDeposits : completedDeposits).length === 0 && (
            <div className="crypto-card rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No {activeTab === 'overview' ? 'active' : 'completed'} deposits
              </h3>
              <p className="text-blue-200 mb-6">
                {activeTab === 'overview' 
                  ? 'Start earning by creating your first deposit'
                  : 'Complete deposits will appear here'
                }
              </p>
              {activeTab === 'overview' && (
                <button
                  onClick={onDeposit}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Create First Deposit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;
