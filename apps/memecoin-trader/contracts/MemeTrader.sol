pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router02 {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
    
    function WETH() external pure returns (address);
}

contract MemeTrader is Ownable, ReentrancyGuard {
    IUniswapV2Router02 public uniswapRouter;

    mapping(address => uint256) public ethBalances; 
    mapping(address => mapping(address => uint256)) public tokenBalances; 

    uint256 public slippageTolerance; // in basis points, e.g., 500 = 5%
    event TradeExecuted(address indexed user, address indexed token, uint256 inputAmount, uint256 outputAmount, uint256 timestamp, string tradeType, string reason);
    event TradeFailed(address indexed user, address indexed token, string tradeType, string reason, uint256 timestamp);
    event DepositETH(address indexed user, uint256 amount);
    event WithdrawETH(address indexed user, uint256 amount);
    event DepositToken(address indexed user, address indexed token, uint256 amount);
    event WithdrawToken(address indexed user, address indexed token, uint256 amount);

    enum TradeType { BUY, SELL }

    constructor(address _uniswapRouter) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        slippageTolerance = 500;
    }

    function depositETH() external payable {
        require(msg.value > 0, "Must send ETH");
        ethBalances[msg.sender] += msg.value;
        emit DepositETH(msg.sender, msg.value);
    }

    function withdrawETH(uint256 amount) external nonReentrant {
        require(ethBalances[msg.sender] >= amount, "Insufficient balance");
        ethBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit WithdrawETH(msg.sender, amount);
    }

    function depositToken(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[msg.sender][token] += amount;
        emit DepositToken(msg.sender, token, amount);
    }

    function withdrawToken(address token, uint256 amount) external nonReentrant {
        require(tokenBalances[msg.sender][token] >= amount, "Insufficient token balance");
        tokenBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit WithdrawToken(msg.sender, token, amount);
    }

    function executeTrade(
        TradeType tradeType,
        address user,
        address token,
        uint256 amount,
        string calldata reason
    ) external onlyOwner nonReentrant {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Amount must be > 0");

        address[] memory path = new address[](2);
        uint256 minOutput;

        if (tradeType == TradeType.BUY) {
            require(ethBalances[user] >= amount, "User has insufficient ETH");

            path[0] = uniswapRouter.WETH();
            path[1] = token;

            uint256[] memory amountsOut = uniswapRouter.getAmountsOut(amount, path);
            minOutput = (amountsOut[1] * (10000 - slippageTolerance)) / 10000;

            uint256[] memory amounts = uniswapRouter.swapExactETHForTokens{value: amount}(
                minOutput,
                path,
                address(this),
                block.timestamp + 300
            );

            ethBalances[user] -= amount;
            tokenBalances[user][token] += amounts[1];

            emit TradeExecuted(user, token, amount, amounts[1], block.timestamp, "BUY", reason);
        } else {
            require(tokenBalances[user][token] >= amount, "User has insufficient tokens");

            path[0] = token;
            path[1] = uniswapRouter.WETH();

            IERC20(token).approve(address(uniswapRouter), amount);

            uint256[] memory amountsOut = uniswapRouter.getAmountsOut(amount, path);
            minOutput = (amountsOut[1] * (10000 - slippageTolerance)) / 10000;

            uint256[] memory amounts = uniswapRouter.swapExactTokensForETH(
                amount,
                minOutput,
                path,
                address(this),
                block.timestamp + 300
            );

            tokenBalances[user][token] -= amount;
            ethBalances[user] += amounts[1];

            emit TradeExecuted(user, token, amount, amounts[1], block.timestamp, "SELL", reason);
        }
    }

    function emergencyWithdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH");
        payable(owner()).transfer(balance);
    }

    function emergencyWithdrawToken(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No tokens");
        IERC20(token).transfer(owner(), balance);
    }

    receive() external payable {}
}
