import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAccount } from 'wagmi';

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
      // Initialize user data
      dispatch({
        type: 'SET_USER',
        payload: {
          userId: address,
          walletAddress: address,
          subscriptionTier: 'free',
          createdAt: new Date(),
        },
      });

      // Load mock deposits
      dispatch({ type: 'SET_DEPOSITS', payload: mockDeposits });
      
      // Calculate totals
      const totalLocked = mockDeposits
        .filter(d => d.status === 'active')
        .reduce((sum, d) => {
          if (d.cryptoAsset === 'ETH') return sum + (d.amount * 3000); // Mock ETH price
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
    } else {
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_DEPOSITS', payload: [] });
      dispatch({ type: 'SET_TOTALS', payload: { totalLocked: 0, totalEarned: 0 } });
    }
  }, [isConnected, address]);

  const createDeposit = (depositData) => {
    const newDeposit = {
      depositId: Date.now().toString(),
      userId: address,
      walletAddress: address,
      ...depositData,
      startDate: new Date(),
      endDate: new Date(Date.now() + depositData.lockPeriod * 24 * 60 * 60 * 1000),
      status: 'active',
      earned: 0,
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_DEPOSIT', payload: newDeposit });
    
    // Update totals
    const newTotalLocked = state.totalLocked + (
      depositData.cryptoAsset === 'ETH' ? depositData.amount * 3000 : depositData.amount
    );
    
    dispatch({
      type: 'SET_TOTALS',
      payload: { totalLocked: newTotalLocked, totalEarned: state.totalEarned },
    });

    return newDeposit;
  };

  const claimDeposit = (depositId) => {
    const deposit = state.deposits.find(d => d.depositId === depositId);
    if (deposit && deposit.status === 'active') {
      dispatch({
        type: 'UPDATE_DEPOSIT',
        payload: { depositId, status: 'completed' },
      });

      // Update totals
      const depositValue = deposit.cryptoAsset === 'ETH' ? deposit.amount * 3000 : deposit.amount;
      const newTotalLocked = state.totalLocked - depositValue;
      
      dispatch({
        type: 'SET_TOTALS',
        payload: { totalLocked: newTotalLocked, totalEarned: state.totalEarned },
      });
    }
  };

  const value = {
    ...state,
    createDeposit,
    claimDeposit,
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