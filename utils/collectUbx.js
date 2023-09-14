'use strict';

const commandLineArgs = require('command-line-args');

const CilUtils = require('./cilUtils');
const Config = require('./config');

let cilUtils;
let concilium;

const collectUbx = async (arrWalletPksAndReminders, strMainWalletAddress, bPerformTransfer = true) => {
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

    for (let objWallet of arrWalletPksAndReminders) {
        console.log(`Processing wallet: Ux${objWallet.address}, reminder: ${objWallet.reminder}`);

        const arrUtxos = await cilUtils.getUtxos(`Ux${objWallet.address}`);

        const nAmount = arrUtxos.reduce((acc, e) => acc + e.amount, 0);

        console.log('Amount, UBX: ', nAmount);

        if (nAmount < objWallet.reminder) {
            console.log('Wallet amount is less than a required reminder');
            continue;
        }

        const nAmountToSend = nAmount - objWallet.reminder;

        console.log('Going to withdraw: ', nAmountToSend);

        if (!bPerformTransfer) continue;

        ({gathered: gatheredAmount, arrCoins} = cilUtils.gatherInputsForAmount(arrUtxos, nAmountToSend, false, true));

        const tx = await cilUtils.createTxWithFunds({
            arrCoins,
            gatheredAmount,
            receiverAddr: strMainWalletAddress,
            amount: nAmountToSend,
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
