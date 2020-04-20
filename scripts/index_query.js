/*
This scripts read the database generated by index_contract_calls.js script and
    interprets the transactions as CoinPairPrice calls, then it shows a table with transaction details.
    Example: ```NETWORK=ganche node index_query.js 0xE2e9570d9f3E63Ca1b6dAf7D0966C5dC151b03DF```

 */
const config = require('./CONFIG');
const txDecoder = require('ethereum-tx-decoder');
const colors = require('colors/safe');
const BigNumber = require('bignumber.js');
const Table = require('cli-table');
const sqlite3 = require('sqlite-async');


async function principal2(conf) {
    const {web3, coinPairPrice} = conf;
    const addr = web3.utils.toChecksumAddress(process.argv[process.argv.length - 1]);
    const contract = new web3.eth.Contract(coinPairPrice.abi, addr);
    let db = await sqlite3.open('./index.db');
    const fnDecoder = new txDecoder.FunctionDecoder(coinPairPrice.abi);
    try {
        // instantiate
        const table = new Table({
            head: ["blocknumber", "message last pub block", "from", "price", "status", "gas", "gasPrice"]
        });
        const sql = "select * from blocks a, txs b where a.id = b.block_id and lower(b.`to`) = ? order by a.number desc, b.transactionIndex desc";
        const pr = (x, st, el) => (x.status ? colors.green(st) : colors.red(el || st));
        let prev = new BigNumber(0);
        await db.each(sql, addr.toLowerCase(), (err, tx) => {
            const args = fnDecoder.decodeFn(tx.input);
            if (args.signature == "switchRound()") {
                table.push([
                    pr(tx, tx.number),
                    pr(tx, "SWITCH ROUND"),
                    pr(tx, tx.from),
                    "SWITCH ROUND",
                    pr(tx, "SUCCESS", "FAILED"),
                    pr(tx, tx.gas),
                    pr(tx, tx.gasPrice),
                ]);
            } else if (args.signature == "publishPrice(uint256,bytes32,uint256,address,uint256,uint8[],bytes32[],bytes32[])") {
                table.push([
                    pr(tx, tx.number),
                    pr(tx, args.blockNumber.toString(10) + " - " + prev.sub(args.blockNumber).toString(10)),
                    pr(tx, tx.from),
                    web3.utils.fromWei(args.price.toString()),
                    pr(tx, "SUCCESS", "FAILED"),
                    pr(tx, tx.gas),
                    pr(tx, tx.gasPrice),
                ]);
                prev = args.blockNumber;
            } else {
                console.log("Invalid signature", args.signature);
            }
        });

        console.log("" + table);
    } finally {
        db.close();
    }
}

async function principal(conf) {
    const {web3, coinPairPrice} = conf;
    const addr = web3.utils.toChecksumAddress(process.argv[process.argv.length - 1]);
    const contract = new web3.eth.Contract(coinPairPrice.abi, addr);
    let db = await sqlite3.open('./index.db');
    const fnDecoder = new txDecoder.FunctionDecoder(coinPairPrice.abi);
    try {
        const SWITCH_ROUND = false;
        const sql = "select * from blocks a, txs b where a.id = b.block_id and lower(b.`to`) = ? order by a.number asc, b.transactionIndex asc";
        if (SWITCH_ROUND) {
            console.log(["timestamp", "blocknumber", "gas"].join("\t"));
        } else {
            console.log(["timestamp", "blocknumber", "lastpubblock", "price", "gas"].join("\t"));
        }
        await db.each(sql, addr.toLowerCase(), (err, tx) => {
            const args = fnDecoder.decodeFn(tx.input);
            if (SWITCH_ROUND) {
                if (args.signature == "switchRound()") {
                    if (tx.status) {
                        const date = new Date(tx.timestamp * 1000);
                        console.log([date.toString(), tx.number, tx.gas].join("\t"));
                    }
                }
            } else {
                if (args.signature == "publishPrice(uint256,bytes32,uint256,address,uint256,uint8[],bytes32[],bytes32[])") {
                    if (tx.status) {
                        const date = new Date(tx.timestamp * 1000).toLocaleString('es-AR', {hour12: false}).replace(",", "");
                        console.log([date, tx.number, args.blockNumber.toString(10), web3.utils.fromWei(args.price.toString()), tx.gas].join("\t"));
                    }
                }

            }
        });
    } finally {
        db.close();
    }
}


config.run(principal);
