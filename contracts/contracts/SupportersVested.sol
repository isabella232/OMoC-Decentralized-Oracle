pragma solidity 0.6.0;

import {IERC20} from "./openzeppelin/token/ERC20/IERC20.sol";
import {SupportersWhitelisted} from "./SupportersWhitelisted.sol";
import {SupportersVestedAbstract} from "./SupportersVestedAbstract.sol";
import {Governed} from "./moc-gobernanza/Governance/Governed.sol";
import {IGovernor} from "./moc-gobernanza/Governance/IGovernor.sol";

/*
    Implementation of SupportersVestedAbstract used by regular supporters.
    This can be merged into SupportersWhitelisted directly, but we choose separate it so
    we can add other contracts with different kind of restrictions to the supporters smart-contract.
*/
contract SupportersVested is Governed {
    SupportersWhitelisted public            supporters;
    IERC20 public                           mocToken;

    function initialize(IGovernor _governor, SupportersWhitelisted _supporters) external initializer {
        require(address(_supporters) != address(0), "Supporters contract address must be != 0");
        require(address(_supporters.mocToken()) != address(0), "Token contract address must be != 0");

        Governed.initialize(_governor);

        supporters = _supporters;
        mocToken = _supporters.mocToken();
    }

    /**
      Deposit earnings that will be credited to supporters.
      Earnings will be credited periodically through several blocks.
      If some user moves by error some MOC to this contract address we transfer them so they are used as rewards.
    */
    function distribute() external {
        // if somebody does a MOC transfer to our address, use the excess as rewards.
        uint256 mocs = mocToken.balanceOf(address(this));
        require(mocToken.transfer(address(supporters), mocs), "Error in transfe");
        supporters.distribute();
    }


    /**
      add MOCs to stake the approve must be done to this contract.

      @param _mocs amount of MOC to stake
    */
    function addStake(uint256 _mocs) external {
        // Transfer stake [should be approved by owner first]
        require(mocToken.transferFrom(msg.sender, address(this), _mocs), "error in transfer from");
        // Stake at Supporters contract
        require(mocToken.approve(address(supporters), _mocs), "error in approve");
        supporters.stakeAtFrom(_mocs, msg.sender, address(this));
    }

    /**
    add MOCs to stake the approve must be done directly to the SupportersWhitelisted contract.

    @param _mocs amount of MOC to stake
    */
    function stakeDirectly(uint256 _mocs) external {
        supporters.stakeAtFrom(_mocs, msg.sender, msg.sender);
    }

    /**
      Stop staking some MOCs
    */
    function stop() external {
        supporters.stop(msg.sender);
    }

    /// @notice Returns true if a supporter can withdraw his money
    //  @param _subaccount subaccount used to withdraw MOC
    function canWithdraw(address _subaccount) external view returns (bool) {
        return supporters.canWithdraw(_subaccount);
    }

    /**
      Withdraw MOCs that were already stopped .
    */
    function withdraw() external {
        uint256 tokens = supporters.getBalanceAt(address(this), msg.sender);
        supporters.withdrawFromTo(tokens, msg.sender, msg.sender);
    }

    /**
      Balance of mocs.

      @param _account User address
      @return balance the balance of the user
    */
    function balanceOf(address _account) external view returns (uint256 balance) {
        require(_account != address(0), "Address must be != 0");
        return supporters.getMOCBalanceAt(address(this), _account);
    }

    /**
      Vesting information for _account.

      @param _account User address
      @return balance the balance of the user
      @return stoppedInblock the block in which the mocs where stopped
    */
    function vestingInfoOf(address _account) public view returns (uint256 balance, uint256 stoppedInblock) {
        return supporters.vestingInfoOf(address(this), _account);
    }


    /**
      Get the minimum number of blocks that a user must stay staked after staking

      @return the minimum number of blocks that a user must stay staked after staking
    */
    function getMinStayBlocks() public view returns (uint256) {
        return supporters.minStayBlocks();
    }


    /**
      Return the period of blocks a user have after a stop and minStayBlock to withdraw

      @return the period of blocks that a user have
    */
    function getAfterStopBlocks() public view returns (uint256) {
        return supporters.afterStopBlocks();
    }
}
