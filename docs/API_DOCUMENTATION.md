# CryptoLock Rewards API Documentation

## Overview

CryptoLock Rewards is a decentralized application that allows users to lock their cryptocurrency for fixed periods to earn predictable rewards. This document outlines the technical specifications and API integrations.

## Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Wallet Integration**: RainbowKit + Wagmi
- **Blockchain**: Base (Ethereum L2)
- **State Management**: React Context + useReducer

### Backend Services
- **Database**: Supabase (PostgreSQL)
- **Blockchain RPC**: Alchemy or QuickNode
- **Smart Contracts**: Solidity 0.8.19

## Smart Contract API

### Contract Address
- **Base Mainnet**: `0x1234567890123456789012345678901234567890` (placeholder)
- **Supported Tokens**:
  - USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
  - WETH: `0x4200000000000000000000000000000000000006`

### Core Functions

#### `createDeposit(address token, uint256 amount, uint256 lockPeriod)`
Creates a new time-locked deposit.

**Parameters:**
- `token`: Address of the ERC20 token to deposit
- `amount`: Amount of tokens to deposit (in token's smallest unit)
- `lockPeriod`: Lock period in days (30, 90, or 180)

**Events Emitted:**
```solidity
event DepositCreated(
    uint256 indexed depositId,
    address indexed user,
    address indexed token,
    uint256 amount,
    uint256 lockPeriod,
    uint256 apy
);
```

#### `claimDeposit(uint256 depositId)`
Claims a matured deposit with rewards.

**Parameters:**
- `depositId`: ID of the deposit to claim

**Requirements:**
- Deposit must be matured (current time >= endTime)
- Caller must be the deposit owner
- Deposit must not be already claimed

#### `calculateRewards(uint256 depositId) view returns (uint256)`
Calculates current rewards for a deposit.

**Returns:**
- `uint256`: Amount of rewards earned (in token's smallest unit)

#### `getUserDeposits(address user) view returns (uint256[])`
Gets all deposit IDs for a user.

**Returns:**
- `uint256[]`: Array of deposit IDs

## Supabase Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Deposits Cache Table
```sql
CREATE TABLE deposits_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deposit_id TEXT UNIQUE NOT NULL,
    user_address TEXT NOT NULL,
    crypto_asset TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    lock_period INTEGER NOT NULL,
    apy DECIMAL NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    earned DECIMAL DEFAULT 0,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Analytics Table
```sql
CREATE TABLE user_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Protocol Stats Table
```sql
CREATE TABLE protocol_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_deposits INTEGER DEFAULT 0,
    total_value_locked DECIMAL DEFAULT 0,
    total_rewards_paid DECIMAL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Frontend API Services

### BlockchainService

#### `getUserDeposits(userAddress)`
Fetches user deposits from the smart contract.

**Parameters:**
- `userAddress`: Ethereum address of the user

**Returns:**
```javascript
Promise<Array<{
  depositId: string,
  cryptoAsset: string,
  amount: number,
  lockPeriod: number,
  apy: number,
  startDate: Date,
  endDate: Date,
  status: 'active' | 'completed',
  earned: number
}>>
```

#### `createDeposit(tokenAddress, amount, lockPeriod)`
Creates a new deposit on the blockchain.

**Parameters:**
- `tokenAddress`: Contract address of the token
- `amount`: Amount to deposit
- `lockPeriod`: Lock period in days

**Returns:**
```javascript
Promise<{
  transactionHash: string,
  blockNumber: bigint,
  status: 'confirmed' | 'failed'
}>
```

### SupabaseService

#### `initializeUser(walletAddress, email?)`
Initializes or retrieves user profile.

**Parameters:**
- `walletAddress`: User's wallet address
- `email`: Optional email address

**Returns:**
```javascript
Promise<{
  wallet_address: string,
  email?: string,
  subscription_tier: 'free' | 'premium',
  created_at: string
}>
```

#### `trackUserAction(walletAddress, action, metadata?)`
Tracks user actions for analytics.

**Parameters:**
- `walletAddress`: User's wallet address
- `action`: Action name (e.g., 'deposit_created', 'wallet_connected')
- `metadata`: Optional metadata object

## APY Rates

### USDC
- 30 days: 6.0% APY
- 90 days: 8.5% APY
- 180 days: 10.0% APY

### WETH
- 30 days: 8.0% APY
- 90 days: 10.5% APY
- 180 days: 12.0% APY

## Error Handling

### Common Error Codes
- `WALLET_NOT_CONNECTED`: User wallet is not connected
- `INSUFFICIENT_BALANCE`: User doesn't have enough tokens
- `INVALID_LOCK_PERIOD`: Lock period is not supported
- `DEPOSIT_NOT_MATURED`: Trying to claim before maturity
- `TRANSACTION_FAILED`: Blockchain transaction failed
- `NETWORK_ERROR`: RPC or network connectivity issues

### Error Response Format
```javascript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable error message',
    details?: any // Additional error details
  }
}
```

## Rate Limits

### Blockchain RPC
- Alchemy: 330 requests/second (Growth plan)
- QuickNode: Varies by plan

### Supabase
- Free tier: 500MB database, 2GB bandwidth
- Pro tier: 8GB database, 100GB bandwidth

## Security Considerations

### Smart Contract Security
- ReentrancyGuard: Prevents reentrancy attacks
- Pausable: Emergency pause functionality
- Ownable: Admin controls for critical functions

### Frontend Security
- Input validation on all user inputs
- Sanitization of user-generated content
- Secure handling of wallet connections

### Backend Security
- Row Level Security (RLS) enabled on Supabase
- API rate limiting
- Input validation and sanitization

## Deployment

### Smart Contract Deployment
1. Deploy to Base testnet first
2. Verify contract on Basescan
3. Deploy to Base mainnet
4. Update contract addresses in environment variables

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Vercel/Netlify
3. Configure environment variables
4. Set up custom domain

### Database Setup
1. Create Supabase project
2. Run SQL migrations
3. Configure Row Level Security
4. Set up database backups

## Monitoring and Analytics

### Key Metrics
- Total Value Locked (TVL)
- Number of active deposits
- User acquisition and retention
- Transaction success rates
- Average deposit amounts and periods

### Monitoring Tools
- Supabase Dashboard for database metrics
- Alchemy/QuickNode dashboards for RPC usage
- Custom analytics tracking user actions

## Support and Maintenance

### Regular Tasks
- Monitor smart contract events
- Update APY rates based on market conditions
- Database maintenance and optimization
- Security audits and updates

### Emergency Procedures
- Smart contract pause functionality
- Database backup and restore procedures
- Incident response plan for security issues
