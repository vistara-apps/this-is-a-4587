# CryptoLock Rewards Deployment Guide

## Prerequisites

Before deploying CryptoLock Rewards, ensure you have:

1. **Node.js 18+** installed
2. **Git** for version control
3. **Wallet** with Base ETH for contract deployment
4. **Supabase account** for backend services
5. **Alchemy or QuickNode account** for RPC access
6. **WalletConnect account** for wallet integration

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/vistara-apps/this-is-a-4587.git
cd this-is-a-4587
npm install
```

### 2. Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Blockchain RPC (choose one)
VITE_ALCHEMY_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
# OR
VITE_QUICKNODE_RPC_URL=https://YOUR_ENDPOINT.base-mainnet.quiknode.pro/YOUR_API_KEY/

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Contract (update after deployment)
VITE_CRYPTOLOCK_CONTRACT=0x1234567890123456789012345678901234567890
```

## Backend Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits cache table
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

-- User analytics table
CREATE TABLE user_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Protocol stats table
CREATE TABLE protocol_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_deposits INTEGER DEFAULT 0,
    total_value_locked DECIMAL DEFAULT 0,
    total_rewards_paid DECIMAL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_deposits_cache_user_address ON deposits_cache(user_address);
CREATE INDEX idx_user_analytics_user_address ON user_analytics(user_address);
CREATE INDEX idx_user_analytics_timestamp ON user_analytics(timestamp);
```

### 3. Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Deposits cache policies
CREATE POLICY "Users can view own deposits" ON deposits_cache
    FOR SELECT USING (user_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own deposits" ON deposits_cache
    FOR INSERT WITH CHECK (user_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Analytics policies (insert only)
CREATE POLICY "Users can insert analytics" ON user_analytics
    FOR INSERT WITH CHECK (user_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Protocol stats (public read)
CREATE POLICY "Anyone can read protocol stats" ON protocol_stats
    FOR SELECT USING (true);
```

## Smart Contract Deployment

### 1. Install Hardhat (if not using Remix)

```bash
npm install --save-dev hardhat @openzeppelin/contracts
```

### 2. Deploy Contract

You can deploy using:
- **Remix IDE** (recommended for beginners)
- **Hardhat** (for advanced users)
- **Foundry** (for advanced users)

#### Using Remix IDE:

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `CryptoLockRewards.sol`
3. Copy the contract code from `src/contracts/CryptoLockRewards.sol`
4. Compile with Solidity 0.8.19
5. Deploy to Base network:
   - Network: Base Mainnet
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: 8453
6. Verify contract on [Basescan](https://basescan.org)

### 3. Update Contract Address

After deployment, update your `.env` file:

```env
VITE_CRYPTOLOCK_CONTRACT=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

Also update the contract address in `src/services/blockchain.js`:

```javascript
export const CONTRACTS = {
  CRYPTOLOCK_REWARDS: '0xYOUR_DEPLOYED_CONTRACT_ADDRESS',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006',
};
```

## Frontend Deployment

### 1. Build Production Bundle

```bash
npm run build
```

### 2. Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard

### 3. Alternative: Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

## Post-Deployment Setup

### 1. Test Core Functionality

1. **Wallet Connection**: Ensure users can connect wallets
2. **Token Balances**: Verify USDC/WETH balances display correctly
3. **Deposits**: Test creating deposits with small amounts
4. **Claims**: Test claiming matured deposits
5. **Subscription**: Test subscription upgrade flow

### 2. Monitor and Analytics

1. **Supabase Dashboard**: Monitor database usage
2. **RPC Usage**: Track Alchemy/QuickNode usage
3. **Error Tracking**: Set up Sentry or similar
4. **User Analytics**: Monitor user actions in Supabase

### 3. Security Checklist

- [ ] Smart contract audited (recommended for mainnet)
- [ ] RLS policies tested and working
- [ ] Environment variables secured
- [ ] HTTPS enabled on frontend
- [ ] Rate limiting configured
- [ ] Input validation implemented

## Maintenance

### Regular Tasks

1. **Monitor TVL**: Track total value locked
2. **Update APY Rates**: Adjust based on market conditions
3. **Database Maintenance**: Clean up old analytics data
4. **Security Updates**: Keep dependencies updated

### Emergency Procedures

1. **Contract Pause**: Use owner functions to pause if needed
2. **Database Backup**: Regular backups via Supabase
3. **Rollback Plan**: Keep previous deployment ready

## Troubleshooting

### Common Issues

1. **RPC Rate Limits**: Upgrade plan or implement caching
2. **Transaction Failures**: Check gas prices and network status
3. **Database Errors**: Check RLS policies and permissions
4. **Wallet Connection**: Verify WalletConnect configuration

### Support Resources

- [Base Documentation](https://docs.base.org)
- [Supabase Documentation](https://supabase.com/docs)
- [RainbowKit Documentation](https://rainbowkit.com)
- [Wagmi Documentation](https://wagmi.sh)

## Cost Estimates

### Monthly Costs (estimated)

- **Supabase**: $0-25 (depending on usage)
- **Alchemy/QuickNode**: $0-49 (depending on requests)
- **Vercel/Netlify**: $0-20 (depending on traffic)
- **Domain**: $10-15/year

### Gas Costs (Base network)

- **Contract Deployment**: ~$50-100
- **User Deposits**: ~$1-3 per transaction
- **Claims**: ~$1-3 per transaction

## Success Metrics

Track these KPIs post-deployment:

- **Total Value Locked (TVL)**
- **Number of Active Users**
- **Average Deposit Amount**
- **User Retention Rate**
- **Transaction Success Rate**
- **Customer Support Tickets**

## Next Steps

After successful deployment:

1. **Marketing**: Announce launch on social media
2. **Community**: Build Discord/Telegram community
3. **Partnerships**: Explore DeFi protocol integrations
4. **Features**: Plan v2 features based on user feedback
5. **Scaling**: Monitor and scale infrastructure as needed
