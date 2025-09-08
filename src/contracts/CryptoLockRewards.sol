// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CryptoLock Rewards
 * @dev Smart contract for time-locked crypto deposits with fixed APY rewards
 */
contract CryptoLockRewards is ReentrancyGuard, Ownable, Pausable {
    struct Deposit {
        uint256 depositId;
        address user;
        address token;
        uint256 amount;
        uint256 lockPeriod; // in days
        uint256 apy; // APY in basis points (e.g., 850 = 8.5%)
        uint256 startTime;
        uint256 endTime;
        bool claimed;
        uint256 rewardsClaimed;
    }

    struct SupportedToken {
        address tokenAddress;
        string symbol;
        bool isActive;
        mapping(uint256 => uint256) apyByPeriod; // lockPeriod => APY in basis points
    }

    // State variables
    mapping(uint256 => Deposit) public deposits;
    mapping(address => SupportedToken) public supportedTokens;
    mapping(address => uint256[]) public userDeposits;
    
    uint256 public nextDepositId = 1;
    uint256 public totalValueLocked;
    uint256 public totalRewardsPaid;
    
    // Events
    event DepositCreated(
        uint256 indexed depositId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 lockPeriod,
        uint256 apy
    );
    
    event DepositClaimed(
        uint256 indexed depositId,
        address indexed user,
        uint256 principal,
        uint256 rewards
    );
    
    event TokenAdded(address indexed token, string symbol);
    event TokenUpdated(address indexed token, uint256 lockPeriod, uint256 apy);
    
    constructor() {
        // Initialize supported tokens for Base chain
        _addSupportedToken(
            0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // USDC on Base
            "USDC"
        );
        
        // Set APY rates for USDC
        supportedTokens[0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913].apyByPeriod[30] = 600;   // 6.0%
        supportedTokens[0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913].apyByPeriod[90] = 850;   // 8.5%
        supportedTokens[0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913].apyByPeriod[180] = 1000; // 10.0%
        
        // Add ETH (wrapped ETH on Base)
        _addSupportedToken(
            0x4200000000000000000000000000000000000006, // WETH on Base
            "WETH"
        );
        
        // Set APY rates for WETH
        supportedTokens[0x4200000000000000000000000000000000000006].apyByPeriod[30] = 800;   // 8.0%
        supportedTokens[0x4200000000000000000000000000000000000006].apyByPeriod[90] = 1050;  // 10.5%
        supportedTokens[0x4200000000000000000000000000000000000006].apyByPeriod[180] = 1200; // 12.0%
    }
    
    /**
     * @dev Create a new time-locked deposit
     * @param token Address of the ERC20 token to deposit
     * @param amount Amount of tokens to deposit
     * @param lockPeriod Lock period in days (30, 90, or 180)
     */
    function createDeposit(
        address token,
        uint256 amount,
        uint256 lockPeriod
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(supportedTokens[token].isActive, "Token not supported");
        require(
            supportedTokens[token].apyByPeriod[lockPeriod] > 0,
            "Invalid lock period"
        );
        
        IERC20 tokenContract = IERC20(token);
        require(
            tokenContract.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        uint256 depositId = nextDepositId++;
        uint256 apy = supportedTokens[token].apyByPeriod[lockPeriod];
        uint256 endTime = block.timestamp + (lockPeriod * 1 days);
        
        deposits[depositId] = Deposit({
            depositId: depositId,
            user: msg.sender,
            token: token,
            amount: amount,
            lockPeriod: lockPeriod,
            apy: apy,
            startTime: block.timestamp,
            endTime: endTime,
            claimed: false,
            rewardsClaimed: 0
        });
        
        userDeposits[msg.sender].push(depositId);
        totalValueLocked += amount;
        
        emit DepositCreated(depositId, msg.sender, token, amount, lockPeriod, apy);
    }
    
    /**
     * @dev Claim matured deposit with rewards
     * @param depositId ID of the deposit to claim
     */
    function claimDeposit(uint256 depositId) external nonReentrant {
        Deposit storage deposit = deposits[depositId];
        require(deposit.user == msg.sender, "Not deposit owner");
        require(!deposit.claimed, "Already claimed");
        require(block.timestamp >= deposit.endTime, "Deposit not matured");
        
        uint256 rewards = calculateRewards(depositId);
        uint256 totalAmount = deposit.amount + rewards;
        
        deposit.claimed = true;
        deposit.rewardsClaimed = rewards;
        totalValueLocked -= deposit.amount;
        totalRewardsPaid += rewards;
        
        IERC20 tokenContract = IERC20(deposit.token);
        require(
            tokenContract.transfer(msg.sender, totalAmount),
            "Transfer failed"
        );
        
        emit DepositClaimed(depositId, msg.sender, deposit.amount, rewards);
    }
    
    /**
     * @dev Calculate rewards for a deposit
     * @param depositId ID of the deposit
     * @return rewards Amount of rewards earned
     */
    function calculateRewards(uint256 depositId) public view returns (uint256) {
        Deposit memory deposit = deposits[depositId];
        if (deposit.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp >= deposit.endTime 
            ? deposit.lockPeriod * 1 days 
            : block.timestamp - deposit.startTime;
            
        // Calculate rewards: (amount * apy * timeElapsed) / (365 days * 10000)
        // APY is in basis points, so divide by 10000
        uint256 rewards = (deposit.amount * deposit.apy * timeElapsed) / (365 days * 10000);
        return rewards;
    }
    
    /**
     * @dev Get user's deposits
     * @param user Address of the user
     * @return Array of deposit IDs
     */
    function getUserDeposits(address user) external view returns (uint256[] memory) {
        return userDeposits[user];
    }
    
    /**
     * @dev Get deposit details
     * @param depositId ID of the deposit
     * @return Deposit struct
     */
    function getDeposit(uint256 depositId) external view returns (Deposit memory) {
        return deposits[depositId];
    }
    
    /**
     * @dev Emergency withdrawal with penalty (forfeits all rewards)
     * @param depositId ID of the deposit to withdraw early
     */
    function emergencyWithdraw(uint256 depositId) external nonReentrant {
        Deposit storage deposit = deposits[depositId];
        require(deposit.user == msg.sender, "Not deposit owner");
        require(!deposit.claimed, "Already claimed");
        require(block.timestamp < deposit.endTime, "Deposit already matured");
        
        deposit.claimed = true;
        totalValueLocked -= deposit.amount;
        
        IERC20 tokenContract = IERC20(deposit.token);
        require(
            tokenContract.transfer(msg.sender, deposit.amount),
            "Transfer failed"
        );
        
        emit DepositClaimed(depositId, msg.sender, deposit.amount, 0);
    }
    
    // Admin functions
    function _addSupportedToken(address token, string memory symbol) internal {
        supportedTokens[token].tokenAddress = token;
        supportedTokens[token].symbol = symbol;
        supportedTokens[token].isActive = true;
        emit TokenAdded(token, symbol);
    }
    
    function addSupportedToken(address token, string memory symbol) external onlyOwner {
        _addSupportedToken(token, symbol);
    }
    
    function updateTokenAPY(
        address token,
        uint256 lockPeriod,
        uint256 apy
    ) external onlyOwner {
        require(supportedTokens[token].isActive, "Token not supported");
        supportedTokens[token].apyByPeriod[lockPeriod] = apy;
        emit TokenUpdated(token, lockPeriod, apy);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency function to withdraw contract funds (only owner)
    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
