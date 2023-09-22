// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WXDC is ERC20 {

    /* *********** */
    /* CONSTRUCTOR */
    /* *********** */
    constructor() ERC20("Wrapped XDC", "wXDC") {}

    /* ****************** */
    /* EXTERNAL FUNCTIONS */
    /* ****************** */

    /**
     * @notice Mint wXDC to user
     * @dev Everyone can call this function
     * @param _to Address that will be received wXDC
     * @param _amount Amount of XCR
     */
    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
