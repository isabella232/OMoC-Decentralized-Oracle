// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import {IERC20} from "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import {Initializable} from "@openzeppelin/upgrades/contracts/Initializable.sol";
import {Governed} from "@moc/shared/contracts/moc-governance/Governance/Governed.sol";
import {IGovernor} from "@moc/shared/contracts/moc-governance/Governance/IGovernor.sol";
import {IStakingMachine} from "@moc/shared/contracts/IStakingMachine.sol";
import {IDelayMachine} from "@moc/shared/contracts/IDelayMachine.sol";
import {DelayMachineStorage} from "./DelayMachineStorage.sol";

contract DelayMachine is DelayMachineStorage, IDelayMachine {
    using SafeMath for uint256;

    event PaymentDeposit(
        uint256 indexed id,
        address source,
        address destination,
        uint256 amount,
        uint256 expiration
    );
    event PaymentCancel(uint256 indexed id, address source, address destination, uint256 amount);
    event PaymentWithdraw(uint256 indexed id, address source, address destination, uint256 amount);

    /// @notice Construct this contract.
    /// @param governor The minimum amount of tokens required as stake for a coin pair subscription.
    /// @param token the Supporters contract contract address.
    function initialize(IGovernor governor, IERC20 token) external initializer {
        _token = token;
        Governed._initialize(governor);
    }

    /// @notice Accept a deposit from an account.
    /// @param mocs token quantity
    /// @param destination the destination address which can control the funds.
    /// @param expiration the expiration date for this deposit
    /// @return id the transaction id
    function deposit(
        uint256 mocs,
        address destination,
        address source,
        uint256 expiration
    ) external override returns (uint256 id) {
        bool done = _token.transferFrom(source, address(this), mocs);
        require(done, "Token transfer failed.");
        _id = _id + 1;
        payments[_id].source = source;
        payments[_id].expiration = block.timestamp + expiration;
        // solhint-disable-previous-line not-rely-on-time
        payments[_id].amount = mocs;
        owners[destination].ids.add(_id);
        emit PaymentDeposit(_id, source, destination, mocs, expiration);
        return _id;
    }

    /// @notice Cancel a transaction returning the funds to the source
    /// @param id transaction id
    function cancel(uint256 id) external override {
        require(owners[msg.sender].ids.contains(id), "Invalid ID");
        owners[msg.sender].ids.remove(id);
        bool done = _token.approve(payments[id].source, payments[id].amount);
        require(done, "Token approve failed.");
        IStakingMachine(payments[id].source).depositFrom(
            payments[id].amount,
            msg.sender,
            address(this)
        );
        address source = payments[id].source;
        uint256 amount = payments[id].amount;
        delete (payments[id]);
        emit PaymentCancel(id, source, msg.sender, amount);
    }

    /// @notice Withdraw stake, send it to the delay machine.
    /// @param id transaction id
    function withdraw(uint256 id) external override {
        require(owners[msg.sender].ids.contains(id), "Invalid ID");
        owners[msg.sender].ids.remove(id);
        require(payments[id].expiration < block.timestamp, "Not expired");
        // solhint-disable-previous-line not-rely-on-time
        bool done = _token.transfer(msg.sender, payments[id].amount);
        require(done, "Token transfer failed.");
        address source = payments[id].source;
        uint256 amount = payments[id].amount;
        delete (payments[id]);
        emit PaymentWithdraw(id, source, msg.sender, amount);
    }

    /// @notice Returns the list of transaction for some account
    /// @param account destination address
    /// @return ids transaction ids
    /// @return amounts token quantity
    /// @return expirations expiration dates
    /// @return sources source addresses
    function getTransactions(address account)
        external
        override
        view
        returns (
            uint256[] memory ids,
            uint256[] memory amounts,
            uint256[] memory expirations,
            address[] memory sources
        )
    {
        uint256 len = owners[account].ids.length();
        ids = new uint256[](len);
        amounts = new uint256[](len);
        expirations = new uint256[](len);
        sources = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            ids[i] = owners[account].ids.at(i);
            amounts[i] = payments[owners[account].ids.at(i)].amount;
            expirations[i] = payments[owners[account].ids.at(i)].expiration;
            sources[i] = payments[owners[account].ids.at(i)].source;
        }
    }

    /// @notice Returns the total balance in MOCs for an account
    /// @param account destination address
    /// @return balance token quantity
    function getBalance(address account) external override view returns (uint256) {
        uint256[] memory amounts;
        (, amounts, , ) = this.getTransactions(account);
        uint256 balance;
        for (uint256 i = 0; i < amounts.length; i++) {
            balance = balance + amounts[i];
        }
        return balance;
    }
}
