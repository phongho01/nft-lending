// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WXDC is ERC20 {
    event Minted(address account, uint256 amount);
    event Burnt(address account, uint256 amount);

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
     */
    function mint() external payable {
        _mint(_msgSender(), msg.value);

        emit Minted(_msgSender(), msg.value);
    }

    function burn(uint256 _amount) external {
        _burn(_msgSender(), _amount);
        (bool success, ) = (_msgSender()).call{value: _amount}("");
        require(success, "Fail transfer native");

        emit Burnt(_msgSender(), _amount);
    }
}
