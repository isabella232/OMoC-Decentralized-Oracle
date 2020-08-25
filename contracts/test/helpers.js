const {constants, BN, time} = require('@openzeppelin/test-helpers');

const ADDRESS_ONE = '0x0000000000000000000000000000000000000001';
exports.ADDRESS_ONE = ADDRESS_ONE;

const ADDRESS_ZERO = constants.ZERO_ADDRESS;
exports.ADDRESS_ZERO = ADDRESS_ZERO;

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

exports.printOracles = printOracles;

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

exports.getDefaultEncodedMessage = getDefaultEncodedMessage;

async function mineUntilNextRound(coinpairPrice) {
    console.log('Please wait for round blocks to be mined...');
    const roundInfo = await coinpairPrice.getRoundInfo();
    do {
        await time.advanceBlock();
    } while (roundInfo.lockPeriodEndBlock.gt(await time.latestBlock()));
}

exports.mineUntilNextRound = mineUntilNextRound;

async function mineUntilBlock(target) {
    let latestBlock = await time.latestBlock();
    while (latestBlock.lt(target)) {
        await time.advanceBlock();
        latestBlock = await time.latestBlock();
    }
}

exports.mineUntilBlock = mineUntilBlock;

async function mineBlocks(num) {
    latestBlock = await time.latestBlock();
    endBlock = latestBlock.add(new BN(num));
    await mineUntilBlock(endBlock);
}

exports.mineBlocks = mineBlocks;

function findEvent(logs, name) {
    return logs.find((log) => log.event === name);
}

exports.findEvent = findEvent;

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

exports.createGovernor = createGovernor;

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

module.exports.coinPairStr = coinPairStr;

function bytes32toBN(pr) {
    pr = pr.replace(/^0x/, '');
    return new BN(pr, 16);
}

module.exports.bytes32toBN = bytes32toBN;
