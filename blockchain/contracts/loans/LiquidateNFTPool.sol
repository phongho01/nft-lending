// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import "../utils/Permission.sol";
import "./direct/loanTypes/IDirectLoanBase.sol";

/**
 * @title  LiquidateNFTPool
 * @dev Implements base functionalities common to all Loan types.
 * Mostly related to governance and security.
 */
contract LiquidateNFTPool is Permission, Pausable, ReentrancyGuard, IERC721Receiver {
    using SafeERC20 for IERC20;
    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    address public loan;

    event LoanPoolRegistration(address indexed account);
    event SetLoanPool(address indexed oldValue, address indexed newValue);
    event LiquidateNFT(
        bytes32 loanId,
        address indexed _erc20Token,
        uint256 amount,
        uint256 indexed nftId,
        uint256 timestamp,
        address indexed nftContract
    );

    /**
     * @notice Sets the admin of the contract.
     *
     * @param _admin - Initial admin of this contract.
     */
    constructor(address _admin) {
        _transferOwnership(_admin);
    }

    function registerLoanPool() external {
        require(address(loan) == address(0), "Loan Pool has already been registered.");
        loan = msg.sender;
        emit LoanPoolRegistration(loan);
    }

    function setLoanPool(address _loan) external notZeroAddress(_loan) onlyOwner {
        address _oldValue = loan;
        loan = _loan;
        emit SetLoanPool(_oldValue, loan);
    }

    /* ********* */
    /* FUNCTIONS */
    /* ********* */

    function liquidateNFT(
        bytes32 _loanId,
        address _nftContract,
        uint256 _nftId,
        address _erc20Token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(msg.sender == loan, "Only Loan can liquidate");
        IERC721(_nftContract).safeTransferFrom(loan, address(this), _nftId, "");
        IERC20(_erc20Token).safeTransfer(IDirectLoanBase(loan).lendingPool(), _amount);

        // Emit an event with all relevant details from this transaction.
        emit LiquidateNFT(_loanId, _erc20Token, _amount, _nftId, block.timestamp, _nftContract);
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - Only the owner can call this method.
     * - The contract must not be paused.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - Only the owner can call this method.
     * - The contract must be paused.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
