import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock data.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase Service Class
 * Handles backend data persistence and user management
 */
export class SupabaseService {
  constructor() {
    this.client = supabase;
    this.isAvailable = !!supabase;
  }

  /**
   * Initialize user profile
   */
  async initializeUser(walletAddress, email = null) {
    if (!this.isAvailable) {
      console.warn('Supabase not available, using local storage');
      return this.mockInitializeUser(walletAddress, email);
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await this.client
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        return existingUser;
      }

      // Create new user
      const { data, error } = await this.client
        .from('users')
        .insert([
          {
            wallet_address: walletAddress,
            email: email,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw new Error('Failed to initialize user profile');
    }
  }

  /**
   * Get user profile
   */
  async getUser(walletAddress) {
    if (!this.isAvailable) {
      return this.mockGetUser(walletAddress);
    }

    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Update user subscription tier
   */
  async updateSubscriptionTier(walletAddress, tier) {
    if (!this.isAvailable) {
      return this.mockUpdateSubscriptionTier(walletAddress, tier);
    }

    try {
      const { data, error } = await this.client
        .from('users')
        .update({ subscription_tier: tier })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription tier:', error);
      throw new Error('Failed to update subscription tier');
    }
  }

  /**
   * Cache deposit data for faster UI loading
   */
  async cacheDeposit(depositData) {
    if (!this.isAvailable) {
      return this.mockCacheDeposit(depositData);
    }

    try {
      const { data, error } = await this.client
        .from('deposits_cache')
        .upsert([
          {
            deposit_id: depositData.depositId,
            user_address: depositData.walletAddress,
            crypto_asset: depositData.cryptoAsset,
            amount: depositData.amount,
            lock_period: depositData.lockPeriod,
            apy: depositData.apy,
            start_date: depositData.startDate,
            end_date: depositData.endDate,
            status: depositData.status,
            earned: depositData.earned || 0,
            transaction_hash: depositData.transactionHash,
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error caching deposit:', error);
      // Don't throw error for caching failures
      return null;
    }
  }

  /**
   * Get cached deposits for faster loading
   */
  async getCachedDeposits(walletAddress) {
    if (!this.isAvailable) {
      return this.mockGetCachedDeposits(walletAddress);
    }

    try {
      const { data, error } = await this.client
        .from('deposits_cache')
        .select('*')
        .eq('user_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(deposit => ({
        depositId: deposit.deposit_id,
        cryptoAsset: deposit.crypto_asset,
        amount: deposit.amount,
        lockPeriod: deposit.lock_period,
        apy: deposit.apy,
        startDate: new Date(deposit.start_date),
        endDate: new Date(deposit.end_date),
        status: deposit.status,
        earned: deposit.earned,
        transactionHash: deposit.transaction_hash,
      }));
    } catch (error) {
      console.error('Error fetching cached deposits:', error);
      return [];
    }
  }

  /**
   * Store user analytics data
   */
  async trackUserAction(walletAddress, action, metadata = {}) {
    if (!this.isAvailable) {
      return this.mockTrackUserAction(walletAddress, action, metadata);
    }

    try {
      const { data, error } = await this.client
        .from('user_analytics')
        .insert([
          {
            user_address: walletAddress,
            action: action,
            metadata: metadata,
            timestamp: new Date().toISOString(),
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error tracking user action:', error);
      // Don't throw error for analytics failures
      return null;
    }
  }

  /**
   * Get protocol statistics
   */
  async getProtocolStats() {
    if (!this.isAvailable) {
      return this.mockGetProtocolStats();
    }

    try {
      const { data, error } = await this.client
        .from('protocol_stats')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching protocol stats:', error);
      return {
        total_users: 0,
        total_deposits: 0,
        total_value_locked: 0,
        total_rewards_paid: 0,
      };
    }
  }

  /**
   * Update protocol statistics (admin function)
   */
  async updateProtocolStats(stats) {
    if (!this.isAvailable) {
      return this.mockUpdateProtocolStats(stats);
    }

    try {
      const { data, error } = await this.client
        .from('protocol_stats')
        .upsert([
          {
            ...stats,
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating protocol stats:', error);
      throw new Error('Failed to update protocol statistics');
    }
  }

  // Mock functions for when Supabase is not available
  mockInitializeUser(walletAddress, email) {
    const user = {
      wallet_address: walletAddress,
      email: email,
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(`user_${walletAddress}`, JSON.stringify(user));
    return user;
  }

  mockGetUser(walletAddress) {
    const userData = localStorage.getItem(`user_${walletAddress}`);
    return userData ? JSON.parse(userData) : null;
  }

  mockUpdateSubscriptionTier(walletAddress, tier) {
    const userData = this.mockGetUser(walletAddress);
    if (userData) {
      userData.subscription_tier = tier;
      localStorage.setItem(`user_${walletAddress}`, JSON.stringify(userData));
      return userData;
    }
    return null;
  }

  mockCacheDeposit(depositData) {
    const key = `deposits_${depositData.walletAddress}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.filter(d => d.depositId !== depositData.depositId);
    updated.push(depositData);
    localStorage.setItem(key, JSON.stringify(updated));
    return depositData;
  }

  mockGetCachedDeposits(walletAddress) {
    const key = `deposits_${walletAddress}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  mockTrackUserAction(walletAddress, action, metadata) {
    const key = `analytics_${walletAddress}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(existing));
    return { success: true };
  }

  mockGetProtocolStats() {
    return {
      total_users: 1250,
      total_deposits: 3420,
      total_value_locked: 2500000,
      total_rewards_paid: 125000,
    };
  }

  mockUpdateProtocolStats(stats) {
    localStorage.setItem('protocol_stats', JSON.stringify(stats));
    return stats;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
