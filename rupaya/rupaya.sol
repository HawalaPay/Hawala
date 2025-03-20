// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Rupaya is ERC20, Ownable, ReentrancyGuard, Pausable {
    IERC20 public usdt;
    uint256 public constant INITIAL_SUPPLY = 100000000000 * 10**18; // 100B tokens
    uint256 public constant RUPEE_PER_USD = 85;
    uint256 public constant MIN_MINT_AMOUNT = 1 * 10**18; // 1 USDT minimum
    uint256 public constant MAX_MINT_AMOUNT = 100000 * 10**18; // 100,000 USDT maximum

    // Events
    event Minted(address indexed user, uint256 usdtAmount, uint256 rupayaAmount);
    event Redeemed(address indexed user, uint256 rupayaAmount, uint256 usdtAmount);
    event PriceUpdated(uint256 newRupeePerUsd);

    // Modifiers
    modifier validAmount(uint256 amount) {
        require(amount >= MIN_MINT_AMOUNT, "Amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "Amount above maximum");
        _;
    }

    constructor(address _usdt) 
        ERC20("Rupaya", "RUPA")
        Ownable(msg.sender) // Pass the deployer's address as the initial owner
    {
        require(_usdt != address(0), "Invalid USDT address");
        usdt = IERC20(_usdt);
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // Rest of the contract remains the same...
    // Convert USDT to Rupaya
    function calculateRupayaAmount(uint256 usdtAmount) public pure returns (uint256) {
        return (usdtAmount * RUPEE_PER_USD * 10**18) / (10**18);
    }

    // Convert Rupaya to USDT
    function calculateUSDTAmount(uint256 rupayaAmount) public pure returns (uint256) {
        return (rupayaAmount * 10**18) / (RUPEE_PER_USD * 10**18);
    }

    // Mint Rupaya tokens by depositing USDT
    function mint(uint256 usdtAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        validAmount(usdtAmount) 
    {
        require(usdt.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        uint256 rupayaAmount = calculateRupayaAmount(usdtAmount);
        _mint(msg.sender, rupayaAmount);
        
        emit Minted(msg.sender, usdtAmount, rupayaAmount);
    }

    // Redeem USDT by burning Rupaya tokens
    function redeem(uint256 rupayaAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        validAmount(rupayaAmount) 
    {
        uint256 usdtAmount = calculateUSDTAmount(rupayaAmount);
        require(usdt.balanceOf(address(this)) >= usdtAmount, "Insufficient USDT reserves");
        
        _burn(msg.sender, rupayaAmount);
        require(usdt.transfer(msg.sender, usdtAmount), "USDT transfer failed");
        
        emit Redeemed(msg.sender, rupayaAmount, usdtAmount);
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency token recovery in case of errors
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        require(tokenAddress != address(this), "Cannot recover Rupaya tokens");
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
    }

    // View functions
    function getReserves() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }

    function getExchangeRate() external pure returns (uint256) {
        return RUPEE_PER_USD;
    }
}