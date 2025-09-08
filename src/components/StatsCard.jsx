import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function StatsCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="crypto-card rounded-lg p-6 hover:glow-effect transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="text-blue-200 text-sm font-medium">{title}</div>
        <div className="text-blue-400">{icon}</div>
      </div>
      
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      
      {trend && (
        <div className="flex items-center space-x-1">
          {trendUp !== undefined && (
            trendUp ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )
          )}
          <span className={`text-sm ${
            trendUp === true ? 'text-green-400' : 
            trendUp === false ? 'text-red-400' : 
            'text-blue-200'
          }`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

export default StatsCard;