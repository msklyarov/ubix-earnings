'use strict';

const elliptic = require('elliptic');
const crypto = require('crypto');
const sha3 = require('js-sha3');

const createHash = crypto.createHash;
const ec = new elliptic.ec('secp256k1');

const processPksReminders = strPksReminders => {
    const arrData = JSON.parse(strPksReminders);

    const arrResult = [];
    for (let i = 0; i < arrData.length; i++) {
        arrResult.push({
            pk: arrData[i][0],
            reminder: arrData[i][1],
            address: calcAddressFromPk(arrData[i][0])
        });
    }

    return arrResult;
};

const calcAddressFromPk = strWalletPk => {
    try {
        const keyPair = ec.keyFromPrivate(strWalletPk);

        const strPublicKey = keyPair.getPublic(true, 'hex');
        return createHash('rmd160').update(sha3.sha3_256(strPublicKey)).digest().toString('hex');
    } catch (error) {
        console.error('getPubKeyAndAddress: Wrong Private Key', error);
        process.exit(1);
    }
};

module.exports = processPksReminders;
