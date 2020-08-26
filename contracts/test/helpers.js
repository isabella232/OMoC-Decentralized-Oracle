const {constants, BN, time} = require('@openzeppelin/test-helpers');

const ADDRESS_ONE = '0x0000000000000000000000000000000000000001';

const ADDRESS_ZERO = constants.ZERO_ADDRESS;

async function printOracles(oracleManager, coinPair) {
    let cnt = 0;
    let it = await oracleManager.getRegisteredOracleHead();
    while (it != ADDRESS_ZERO) {
        const info = await oracleManager.getOracleRegistrationInfo(it);
        const roundInfo = await oracleManager.getOracleRoundInfo(it, coinPair);
        console.log(
            '------------------------------>',
            ++cnt,
            coinPair,
            it,
            info.internetName,
            info.stake.toString(),
            roundInfo.points.toString(),
            await oracleManager.isSubscribed(it, coinPair),
            roundInfo.selectedInRound.toString(),
            roundInfo.selectedInCurrentRound,
        );
        it = await oracleManager.getRegisteredOracleNext(it);
    }
}

async function getDefaultEncodedMessage(version, coinpair, price, votedOracle, blockNumber) {
    const msg = {
        version,
        coinpair,
        price,
        votedOracle,
        blockNumber,
    };

    // Message size (after header): 148 (32+32+32+20+32)

    const encVersion = web3.eth.abi.encodeParameter('uint256', msg.version).substr(2);
    const encCoinpair = web3.eth.abi
        .encodeParameter('bytes32', web3.utils.asciiToHex(coinpair))
        .substr(2);
    const encPrice = web3.eth.abi.encodeParameter('uint256', msg.price).substr(2);
    const encOracle = msg.votedOracle.substr(2);
    const encBlockNum = web3.eth.abi.encodeParameter('uint256', msg.blockNumber).substr(2);

    const encMsg = '0x' + encVersion + encCoinpair + encPrice + encOracle + encBlockNum;
    // console.log(encMsg);
    // console.log("Length:" , encMsg.length);

    return {msg, encMsg};
}

async function mineUntilNextRound(coinpairPrice) {
    console.log('Please wait for round blocks to be mined...');
    const roundInfo = await coinpairPrice.getRoundInfo();
    await time.increaseTo(roundInfo.lockPeriodTimestamp);
}

async function mineUntilBlock(target) {
    let latestBlock = await time.latestBlock();
    while (latestBlock.lt(target)) {
        await time.advanceBlock();
        latestBlock = await time.latestBlock();
    }
}

async function mineBlocks(num) {
    const latestBlock = await time.latestBlock();
    const endBlock = latestBlock.add(new BN(num));
    await mineUntilBlock(endBlock);
}

function findEvent(logs, name) {
    return logs.find((log) => log.event === name);
}

async function createGovernor(owner) {
    const Governor = artifacts.require('Governor');
    const OracleManagerPairChange = artifacts.require('OracleManagerPairChange');
    const TestMOCMintChange = artifacts.require('TestMOCMintChange');
    const governor = await Governor.new();
    await governor.initialize(owner);
    return {
        addr: governor.address,
        address: governor.address,
        governor,
        registerCoinPair: async (oracleManagerContract, coinPair, address) => {
            const change = await OracleManagerPairChange.new(
                oracleManagerContract.address,
                coinPair,
                address,
            );
            await governor.executeChange(change.address, {from: owner});
        },
        mint: async (tokenAddr, addr, quantity) => {
            const change = await TestMOCMintChange.new(tokenAddr, addr, quantity);
            await governor.executeChange(change.address, {from: owner});
        },
        execute: async (change) => {
            await governor.executeChange(change.address, {from: owner});
        },
    };
}

function coinPairStr(hex) {
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
        const ch = hex.substr(n, 2);
        if (ch == '0x' || ch == '00') {
            continue;
        }
        str += String.fromCharCode(parseInt(ch, 16));
    }
    return str;
}

function bytes32toBN(pr) {
    pr = pr.replace(/^0x/, '');
    return new BN(pr, 16);
}

async function initContracts({governorOwner, period, minSubscriptionStake}) {
    const TestMOC = artifacts.require('TestMOC');
    const OracleManager = artifacts.require('OracleManager');
    const SupportersWhitelisted = artifacts.require('SupportersWhitelisted');
    const Staking = artifacts.require('Staking');
    const CoinPairPrice = artifacts.require('CoinPairPrice');
    const MockDelayMachine = artifacts.require('MockDelayMachine');

    const governor = await createGovernor(governorOwner);
    const token = await TestMOC.new();
    await token.initialize(governor.address);
    const oracleMgr = await OracleManager.new();
    const supporters = await SupportersWhitelisted.new();
    const delayMachine = await MockDelayMachine.new();
    await delayMachine.initialize(governor.address, token.address);
    const staking = await Staking.new();

    await supporters.initialize(
        governor.address,
        [oracleMgr.address, staking.address],
        token.address,
        period,
    );
    await oracleMgr.initialize(governor.address, minSubscriptionStake, supporters.address);
    await staking.initialize(
        governor.address,
        supporters.address,
        oracleMgr.address,
        delayMachine.address,
    );

    return {
        governor,
        token,
        oracleMgr,
        supporters,
        delayMachine,
        staking,
    };
}

module.exports = {
    ADDRESS_ONE,
    ADDRESS_ZERO,
    bytes32toBN,
    coinPairStr,
    createGovernor,
    findEvent,
    getDefaultEncodedMessage,
    initContracts,
    mineBlocks,
    mineUntilBlock,
    mineUntilNextRound,
    printOracles,
};
