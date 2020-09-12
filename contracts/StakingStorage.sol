// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;

import {IDelayMachine} from "@moc/shared/contracts/IDelayMachine.sol";
import {Initializable} from "@openzeppelin/contracts-ethereum-package/contracts/Initializable.sol";
import {Governed} from "@moc/shared/contracts/moc-governance/Governance/Governed.sol";
import {Supporters} from "./Supporters.sol";
import {OracleManager} from "./OracleManager.sol";
import {SafeMath} from "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import {IERC20} from "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import {IterableWhitelistLib, IIterableWhitelist} from "./libs/IterableWhitelistLib.sol";

contract StakingStorage is Initializable, Governed, IIterableWhitelist {
    using SafeMath for uint256;
    using IterableWhitelistLib for IterableWhitelistLib.IterableWhitelistData;

    Supporters public supporters;
    OracleManager public oracleManager;
    IERC20 public mocToken;
    IDelayMachine public delayMachine;

    // Whitelisted contracts that can lock stake.
    IterableWhitelistLib.IterableWhitelistData internal iterableWhitelistDataLock;

    uint256 public thirtyDays = 60 * 60 * 24 * 30;

    // Empty internal constructor, to prevent people from mistakenly deploying
    // an instance of this contract, which should be used via inheritance.
    // solhint-disable-next-line no-empty-blocks
    constructor() internal {}

    // Reserved storage space to allow for layout changes in the future.
    uint256[50] private ______gap;
}
