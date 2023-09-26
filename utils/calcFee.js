'use strict';

const calcFee = (nInputUsed, bSingle) => {
    // одна подпись - 67
    // один инпут - 38 или 39 (если nOut больше 256 он будет занимать 2 байта!
    // один аутпут - 33
    const nEmptyTx = 6;

    // может быть 33, точно считать не буду
    const nOutByteSize = 66;
    const nInSize = nInputUsed * 39;

    // 1 ключ на все?
    const nSigSize = bSingle ? 67 : nInputUsed * 67;

    const nFee = parseInt((process.env.TRANSFER_FEE / 1024) * (nEmptyTx + nOutByteSize + nInSize + nSigSize + 2)) + 1;

    // разнятся данные по подсчётам стоимости, поэтому возьмём больше
    return 2 * nFee;
};

module.exports = calcFee;
