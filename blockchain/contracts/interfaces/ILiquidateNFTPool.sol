// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 *  @title  LiquidateNFT Pool Interface
 *
 */
interface ILiquidateNFTPool {
    function registerLoanPool() external;

    function liquidateNFT(bytes32 _loanId, address _nftContract, uint256 _nftId, address _erc20Token, uint256 _amount) external;
}
