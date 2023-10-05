'use strict';

const assert = require('assert');

const factory = require('chain-in-law');
const Config = require('./config');

/**
 *
 * @param {Number} nInputsCount
 * @param {Number} nOutputsCount
 * @param {Boolean} bOneSignature - будет подписано 1 приватником?
 * @returns {number}
 */
const estimateTxFee = (nInputsCount, nOutputsCount, bOneSignature) => {
    assert(nInputsCount > 0, 'No inputs in tx!');
    assert(nOutputsCount > 0, 'No outputs in tx!');

    const nFeePerInputOutput = /*Config.FEE_PER_INPUT_OUTPUT ||*/ factory.Constants.fees.TX_FEE * 0.12;
    const nFeePerInputNoSign = factory.Constants.fees.TX_FEE * 0.04;

    return bOneSignature
        ? nFeePerInputNoSign * nInputsCount + nFeePerInputOutput * nOutputsCount
        : nFeePerInputOutput * (nOutputsCount + nInputsCount);
};

module.exports = estimateTxFee;
