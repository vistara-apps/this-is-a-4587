import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { blockchainService, CONTRACTS } from '../services/blockchain';
import { supabaseService } from '../services/supabase';

const AppContext = createContext();

const initialState = {
  user: null,
  deposits: [],
  totalLocked: 0,
  totalEarned: 0,
  subscriptionTier: 'free',
  loading: false,
  error: null,
};

const mockDeposits = [
  {
    depositId: '1',
    cryptoAsset: 'USDC',
    amount: 1000,
    lockPeriod: 90,
    apy: 8.5,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-15'),
    status: 'active',
    earned: 21.25,
  },
  {
    depositId: '2',
    cryptoAsset: 'ETH',
    amount: 2.5,
    lockPeriod: 180,
    apy: 12.0,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-01'),
    status: 'active',
    earned: 0.15,
  },
  {
    depositId: '3',
    cryptoAsset: 'USDC',
    amount: 500,
    lockPeriod: 30,
    apy: 6.0,
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-31'),
    status: 'completed',
    earned: 2.5,
  },
];

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_DEPOSITS':
      return { ...state, deposits: action.payload };
    case 'ADD_DEPOSIT':
      return { ...state, deposits: [...state.deposits, action.payload] };
    case 'UPDATE_DEPOSIT':
      return {
        ...state,
        deposits: state.deposits.map(deposit =>
          deposit.depositId === action.payload.depositId
            ? { ...deposit, ...action.payload }
            : deposit
        ),
      };
    case 'SET_TOTALS':
      return {
        ...state,
        totalLocked: action.payload.totalLocked,
        totalEarned: action.payload.totalEarned,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUBSCRIPTION_TIER':
      return { ...state, subscriptionTier: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      initializeUserData(address);
    } else {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_DEPOSITS', payload: [] });
      dispatch({ type: 'SET_TOTALS', payload: { totalLocked: 0, totalEarned: 0 } });
    }
  }, [isConnected, address]);

  const initializeUserData = async (walletAddress) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Initialize user in backend
      const user = await supabaseService.initializeUser(walletAddress);
      
      dispatch({
        type: 'SET_USER',
        payload: {
          userId: walletAddress,
          walletAddress: walletAddress,
          subscriptionTier: user?.subscription_tier || 'free',
          createdAt: new Date(user?.created_at || Date.now()),
        },
      });

      dispatch({
        type: 'SET_SUBSCRIPTION_TIER',
        payload: user?.subscription_tier || 'free',
      });

      // Try to load real deposits from blockchain
      try {
        const deposits = await blockchainService.getUserDeposits(walletAddress);
        dispatch({ type: 'SET_DEPOSITS', payload: deposits });
        
        // Calculate totals from real data
        const totalLocked = deposits
          .filter(d => d.status === 'active')
          .reduce((sum, d) => {
            if (d.cryptoAsset === 'WETH') return sum + (d.amount * 3000); // Mock ETH price
            return sum + d.amount;
          }, 0);
        
        const totalEarned = deposits.reduce((sum, d) => {
          if (d.cryptoAsset === 'WETH') return sum + (d.earned * 3000);
          return sum + d.earned;
        }, 0);

        dispatch({
          type: 'SET_TOTALS',
          payload: { totalLocked, totalEarned },
        });

        // Track user connection
        await supabaseService.trackUserAction(walletAddress, 'wallet_connected');
      } catch (blockchainError) {
        console.warn('Blockchain not available, using cached/mock data:', blockchainError);
        
        // Fallback to cached data or mock data
        const cachedDeposits = await supabaseService.getCachedDeposits(walletAddress);
        const depositsToUse = cachedDeposits.length > 0 ? cachedDeposits : mockDeposits;
        
        dispatch({ type: 'SET_DEPOSITS', payload: depositsToUse });
        
        // Calculate totals from fallback data
        const totalLocked = depositsToUse
          .filter(d => d.status === 'active')
          .reduce((sum, d) => {
            if (d.cryptoAsset === 'ETH' || d.cryptoAsset === 'WETH') return sum + (d.amount * 3000);
            return sum + d.amount;
          }, 0);
        
        const totalEarned = depositsToUse.reduce((sum, d) => {
          if (d.cryptoAsset === 'ETH' || d.cryptoAsset === 'WETH') return sum + (d.earned * 3000);
          return sum + d.earned;
        }, 0);

        dispatch({
          type: 'SET_TOTALS',
          payload: { totalLocked, totalEarned },
        });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback to mock data
      dispatch({ type: 'SET_DEPOSITS', payload: mockDeposits });
      const totalLocked = mockDeposits
        .filter(d => d.status === 'active')
        .reduce((sum, d) => {
          if (d.cryptoAsset === 'ETH') return sum + (d.amount * 3000);
          return sum + d.amount;
        }, 0);
      
      const totalEarned = mockDeposits.reduce((sum, d) => {
        if (d.cryptoAsset === 'ETH') return sum + (d.earned * 3000);
        return sum + d.earned;
      }, 0);

      dispatch({
        type: 'SET_TOTALS',
        payload: { totalLocked, totalEarned },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createDeposit = async (depositData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Get token address based on symbol
      const tokenAddress = depositData.cryptoAsset === 'USDC' 
        ? CONTRACTS.USDC 
        : CONTRACTS.WETH;

      // Create deposit on blockchain
      const result = await blockchainService.createDeposit(
        tokenAddress,
        depositData.amount,
        depositData.lockPeriod
      );

      if (result.status === 'confirmed') {
        // Create deposit object
        const newDeposit = {
          depositId: Date.now().toString(),
          userId: address,
          walletAddress: address,
          ...depositData,
          startDate: new Date(),
          endDate: new Date(Date.now() + depositData.lockPeriod * 24 * 60 * 60 * 1000),
          status: 'active',
          earned: 0,
          transactionHash: result.transactionHash,
          createdAt: new Date(),
        };

        dispatch({ type: 'ADD_DEPOSIT', payload: newDeposit });
        
        // Update totals
        const newTotalLocked = state.totalLocked + (
          depositData.cryptoAsset === 'WETH' ? depositData.amount * 3000 : depositData.amount
        );
        
        dispatch({
          type: 'SET_TOTALS',
          payload: { totalLocked: newTotalLocked, totalEarned: state.totalEarned },
        });

        // Cache deposit in backend
        await supabaseService.cacheDeposit(newDeposit);
        
        // Track user action
        await supabaseService.trackUserAction(address, 'deposit_created', {
          amount: depositData.amount,
          asset: depositData.cryptoAsset,
          lockPeriod: depositData.lockPeriod,
        });

        return newDeposit;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const claimDeposit = async (depositId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const deposit = state.deposits.find(d => d.depositId === depositId);
      if (!deposit || deposit.status !== 'active') {
        throw new Error('Invalid deposit or already claimed');
      }

      // Claim deposit on blockchain
      const result = await blockchainService.claimDeposit(depositId);

      if (result.status === 'confirmed') {
        dispatch({
          type: 'UPDATE_DEPOSIT',
          payload: { depositId, status: 'completed' },
        });

        // Update totals
        const depositValue = deposit.cryptoAsset === 'WETH' ? deposit.amount * 3000 : deposit.amount;
        const newTotalLocked = state.totalLocked - depositValue;
        
        dispatch({
          type: 'SET_TOTALS',
          payload: { totalLocked: newTotalLocked, totalEarned: state.totalEarned },
        });

        // Update cache
        await supabaseService.cacheDeposit({
          ...deposit,
          status: 'completed',
          transactionHash: result.transactionHash,
        });

        // Track user action
        await supabaseService.trackUserAction(address, 'deposit_claimed', {
          depositId,
          amount: deposit.amount,
          asset: deposit.cryptoAsset,
        });

        return result;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error claiming deposit:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const upgradeSubscription = async (tier) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await supabaseService.updateSubscriptionTier(address, tier);
      dispatch({ type: 'SET_SUBSCRIPTION_TIER', payload: tier });
      
      // Track user action
      await supabaseService.trackUserAction(address, 'subscription_upgraded', { tier });
      
      return { success: true };
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    ...state,
    createDeposit,
    claimDeposit,
    upgradeSubscription,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
