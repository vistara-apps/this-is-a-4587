import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { getAccount, getWalletClient } from '@wagmi/core';

// Contract addresses on Base
export const CONTRACTS = {
  CRYPTOLOCK_REWARDS: '0x1234567890123456789012345678901234567890', // Deploy address
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006',
};

// RPC Configuration
const RPC_URL = import.meta.env.VITE_ALCHEMY_RPC_URL || 
                import.meta.env.VITE_QUICKNODE_RPC_URL || 
                'https://mainnet.base.org';

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

// Contract ABI (simplified for key functions)
export const CRYPTOLOCK_ABI = [
  {
    "inputs": [
      {"name": "token", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "lockPeriod", "type": "uint256"}
    ],
    "name": "createDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "depositId", "type": "uint256"}],
    "name": "claimDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "depositId", "type": "uint256"}],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserDeposits",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "depositId", "type": "uint256"}],
    "name": "getDeposit",
    "outputs": [{
      "components": [
        {"name": "depositId", "type": "uint256"},
        {"name": "user", "type": "address"},
        {"name": "token", "type": "address"},
        {"name": "amount", "type": "uint256"},
        {"name": "lockPeriod", "type": "uint256"},
        {"name": "apy", "type": "uint256"},
        {"name": "startTime", "type": "uint256"},
        {"name": "endTime", "type": "uint256"},
        {"name": "claimed", "type": "bool"},
        {"name": "rewardsClaimed", "type": "uint256"}
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "depositId", "type": "uint256"}],
    "name": "calculateRewards",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalValueLocked",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRewardsPaid",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ERC20 ABI for token operations
export const ERC20_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Blockchain Service Class
 * Handles all smart contract interactions
 */
export class BlockchainService {
  constructor() {
    this.publicClient = publicClient;
  }

  /**
   * Get user's deposits from the blockchain
   */
  async getUserDeposits(userAddress) {
    try {
      const depositIds = await this.publicClient.readContract({
        address: CONTRACTS.CRYPTOLOCK_REWARDS,
        abi: CRYPTOLOCK_ABI,
        functionName: 'getUserDeposits',
        args: [userAddress],
      });

      const deposits = await Promise.all(
        depositIds.map(async (depositId) => {
          const deposit = await this.publicClient.readContract({
            address: CONTRACTS.CRYPTOLOCK_REWARDS,
            abi: CRYPTOLOCK_ABI,
            functionName: 'getDeposit',
            args: [depositId],
          });

          const rewards = await this.publicClient.readContract({
            address: CONTRACTS.CRYPTOLOCK_REWARDS,
            abi: CRYPTOLOCK_ABI,
            functionName: 'calculateRewards',
            args: [depositId],
          });

          return {
            depositId: deposit.depositId.toString(),
            cryptoAsset: this.getTokenSymbol(deposit.token),
            amount: this.formatTokenAmount(deposit.amount, deposit.token),
            lockPeriod: Number(deposit.lockPeriod),
            apy: Number(deposit.apy) / 100, // Convert from basis points
            startDate: new Date(Number(deposit.startTime) * 1000),
            endDate: new Date(Number(deposit.endTime) * 1000),
            status: deposit.claimed ? 'completed' : 'active',
            earned: this.formatTokenAmount(rewards, deposit.token),
          };
        })
      );

      return deposits;
    } catch (error) {
      console.error('Error fetching user deposits:', error);
      throw new Error('Failed to fetch deposits from blockchain');
    }
  }

  /**
   * Create a new deposit
   */
  async createDeposit(tokenAddress, amount, lockPeriod) {
    try {
      const walletClient = await getWalletClient();
      const account = getAccount();

      if (!walletClient || !account.address) {
        throw new Error('Wallet not connected');
      }

      // First, approve the token transfer
      const tokenAmount = this.parseTokenAmount(amount, tokenAddress);
      
      const approveTx = await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.CRYPTOLOCK_REWARDS, tokenAmount],
        account: account.address,
      });

      // Wait for approval confirmation
      await this.publicClient.waitForTransactionReceipt({ hash: approveTx });

      // Create the deposit
      const depositTx = await walletClient.writeContract({
        address: CONTRACTS.CRYPTOLOCK_REWARDS,
        abi: CRYPTOLOCK_ABI,
        functionName: 'createDeposit',
        args: [tokenAddress, tokenAmount, lockPeriod],
        account: account.address,
      });

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: depositTx 
      });

      return {
        transactionHash: depositTx,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
      };
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw new Error(`Failed to create deposit: ${error.message}`);
    }
  }

  /**
   * Claim a matured deposit
   */
  async claimDeposit(depositId) {
    try {
      const walletClient = await getWalletClient();
      const account = getAccount();

      if (!walletClient || !account.address) {
        throw new Error('Wallet not connected');
      }

      const claimTx = await walletClient.writeContract({
        address: CONTRACTS.CRYPTOLOCK_REWARDS,
        abi: CRYPTOLOCK_ABI,
        functionName: 'claimDeposit',
        args: [BigInt(depositId)],
        account: account.address,
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: claimTx 
      });

      return {
        transactionHash: claimTx,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
      };
    } catch (error) {
      console.error('Error claiming deposit:', error);
      throw new Error(`Failed to claim deposit: ${error.message}`);
    }
  }

  /**
   * Emergency withdraw (with penalty)
   */
  async emergencyWithdraw(depositId) {
    try {
      const walletClient = await getWalletClient();
      const account = getAccount();

      if (!walletClient || !account.address) {
        throw new Error('Wallet not connected');
      }

      const withdrawTx = await walletClient.writeContract({
        address: CONTRACTS.CRYPTOLOCK_REWARDS,
        abi: CRYPTOLOCK_ABI,
        functionName: 'emergencyWithdraw',
        args: [BigInt(depositId)],
        account: account.address,
      });

      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash: withdrawTx 
      });

      return {
        transactionHash: withdrawTx,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 'success' ? 'confirmed' : 'failed',
      };
    } catch (error) {
      console.error('Error with emergency withdrawal:', error);
      throw new Error(`Failed to withdraw: ${error.message}`);
    }
  }

  /**
   * Get protocol statistics
   */
  async getProtocolStats() {
    try {
      const [totalValueLocked, totalRewardsPaid] = await Promise.all([
        this.publicClient.readContract({
          address: CONTRACTS.CRYPTOLOCK_REWARDS,
          abi: CRYPTOLOCK_ABI,
          functionName: 'totalValueLocked',
        }),
        this.publicClient.readContract({
          address: CONTRACTS.CRYPTOLOCK_REWARDS,
          abi: CRYPTOLOCK_ABI,
          functionName: 'totalRewardsPaid',
        }),
      ]);

      return {
        totalValueLocked: formatEther(totalValueLocked),
        totalRewardsPaid: formatEther(totalRewardsPaid),
      };
    } catch (error) {
      console.error('Error fetching protocol stats:', error);
      return {
        totalValueLocked: '0',
        totalRewardsPaid: '0',
      };
    }
  }

  /**
   * Get token balance for user
   */
  async getTokenBalance(userAddress, tokenAddress) {
    try {
      const balance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      });

      return this.formatTokenAmount(balance, tokenAddress);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  /**
   * Helper methods
   */
  getTokenSymbol(tokenAddress) {
    switch (tokenAddress.toLowerCase()) {
      case CONTRACTS.USDC.toLowerCase():
        return 'USDC';
      case CONTRACTS.WETH.toLowerCase():
        return 'WETH';
      default:
        return 'UNKNOWN';
    }
  }

  getTokenDecimals(tokenAddress) {
    switch (tokenAddress.toLowerCase()) {
      case CONTRACTS.USDC.toLowerCase():
        return 6;
      case CONTRACTS.WETH.toLowerCase():
        return 18;
      default:
        return 18;
    }
  }

  parseTokenAmount(amount, tokenAddress) {
    const decimals = this.getTokenDecimals(tokenAddress);
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
  }

  formatTokenAmount(amount, tokenAddress) {
    const decimals = this.getTokenDecimals(tokenAddress);
    return Number(amount) / Math.pow(10, decimals);
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
