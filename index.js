'use strict';

require('dotenv').config();

const processPksReminders = require('./utils/processPksReminders');
const collectUbx = require('./utils/collectUbx');

(async () => {
    // result: pk, address, reminder
    const arrWalletPksAndReminders = processPksReminders(process.env.WALLET_PKS_REMINDERS);

    // последний - флаг вывести балансы, но не переводить
    await collectUbx(arrWalletPksAndReminders, process.env.MAIN_PROJECT_WALLET, true);
})();
