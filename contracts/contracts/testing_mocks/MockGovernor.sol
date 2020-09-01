// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import {ChangeContract} from "@moc/shared/contracts/moc-governance/Governance/ChangeContract.sol";
import {IGovernor} from "@moc/shared/contracts/moc-governance/Governance/IGovernor.sol";

/**
  @title MockGovernor
  @notice This contract is not intended to be used in a production system
          It was designed to be using in a testing environment only
          A mock governor that let any address do anything.
  */
contract MockGovernor is IGovernor {
    address public changer;

    constructor(address _changer) public {
        changer = _changer;
    }

    /**
      @notice Function to be called to make the changes in changeContract
     */
    function executeChange(ChangeContract) external override {
        require(false, "Unimplemented");
    }

    /**
      @notice Returns true if the _changer address is currently authorized to make
      changes within the system
      @param _changer Address of the contract that will be tested
     */
    function isAuthorizedChanger(address _changer) external override view returns (bool) {
        require(changer == _changer, "Invalid changer");
        return true;
    }
}
