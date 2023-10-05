'use strict';

const commandLineArgs = require('command-line-args');

const CilUtils = require('./cilUtils');
const Config = require('./config');
const estimateTxFee = require('./estimateTxFee');

let cilUtils;
let concilium;

const sleep = delay => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), delay);
    });
};

const collectUbx = async (arrWalletPksAndReminders, arrWalletsTo, bWaitForTx = false) => {
    if (!cilUtils) {
        // Читаем опции
        const options = readCmdLineOptions();

        ({concilium} = options);

        cilUtils = new CilUtils({
            ...options,
            privateKey: arrWalletPksAndReminders[0].pk
        });

        await cilUtils.asyncLoaded();
    }

    let arrCoins;
    let gatheredAmount;

    for (const objWallet of arrWalletPksAndReminders) {
        console.log(`Processing wallet: Ux${objWallet.address}, reminder: ${objWallet.reminder}`);

        const arrUtxos = await cilUtils.getUtxos(`Ux${objWallet.address}`);

        const nAmount = arrUtxos.reduce((acc, e) => acc + e.amount, 0);

        console.log('Amount, UBX: ', nAmount);

        if (nAmount < objWallet.reminder) {
            console.log('Wallet amount is less than a required reminder');
            continue;
        }

        // увеличим оценку вдвое на всякий случай
        const nFeeEstimation = 2 * estimateTxFee(arrUtxos.length, arrWalletsTo.length, true);

        console.log('Fee estimation: ', nFeeEstimation);

        const totalPercent = arrWalletsTo.map(item => item[1]).reduce((acc, curr) => acc + curr, 0);

        if (totalPercent > 100) {
            console.error('Percent count more than 100%');
            continue;
        }

        const nAmountToSend = nAmount - objWallet.reminder - nFeeEstimation;

        console.log('Going to withdraw: ', nAmountToSend);

        if (nAmountToSend < nFeeEstimation) {
            console.error('Amount to send is less than a transaction fee');
            continue;
        }

        const arrWalletsToWithAmounts = arrWalletsTo.map(item => [
            item[0],
            Math.floor((nAmountToSend * item[1]) / 100)
        ]);

        for (let i = 0; i < arrWalletsTo.length; i++) {
            console.log(
                `Receiver address: Ux${arrWalletsTo[i][0]}, part: ${arrWalletsTo[i][1]}%, UBX: ${arrWalletsToWithAmounts[i][1]}`
            );
        }

        ({gathered: gatheredAmount, arrCoins} = cilUtils.gatherInputsForAmount(arrUtxos, nAmountToSend, false, true));

        const tx = await cilUtils.createTxWithFunds({
            arrCoins,
            gatheredAmount,
            arrReceivers: arrWalletsToWithAmounts,
            nOutputs: 1,
            nConciliumId: concilium || 0,
            strFromAddress: objWallet.address,
            strFromPk: objWallet.pk
        });

        if (process.env.DEBUG) {
            console.error(
                `Here is TX containment: ${JSON.stringify(
                    CilUtils.prepareForStringifyObject(tx.rawData),
                    undefined,
                    2
                )}`
            );
            console.error('Here is your tx. You can send it via RPC.sendRawTx call');
            console.log(tx.encode().toString('hex'));
        }

        await cilUtils.sendTx(tx);
        console.error(`Tx ${tx.getHash()} successfully sent`);

        if (bWaitForTx) {
            console.log('Will wait for the transaction...');
            await cilUtils.waitTxDoneExplorer(tx.getHash());
            console.log('Completed. Check in the explorer');
        }
    }
};

const readCmdLineOptions = () => {
    const {RPC_ADDRESS, RPC_PORT, RPC_USER = '', PRC_PASS = '', API_URL} = Config;

    const optionDefinitions = [
        {name: 'rpcAddress', type: String, multiple: false, defaultValue: RPC_ADDRESS},
        {name: 'rpcPort', type: Number, multiple: false, defaultValue: RPC_PORT},
        {name: 'rpcUser', type: String, multiple: false, defaultValue: RPC_USER},
        {name: 'rpcPass', type: String, multiple: false, defaultValue: PRC_PASS},
        {name: 'fundsPk', type: String, multiple: false},
        {name: 'receiverAddr', type: String, multiple: false},
        {name: 'justCreateTx', type: Boolean, multiple: false, defaultValue: false},
        {name: 'utxo', type: String, multiple: true},
        {name: 'apiUrl', type: String, multiple: false, defaultValue: API_URL},
        {name: 'amountHas', type: Number, multiple: false}
    ];
    return commandLineArgs(optionDefinitions, {camelCase: true});
};

module.exports = collectUbx;
