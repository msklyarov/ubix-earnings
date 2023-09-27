'use strict';

require('dotenv').config();

const processPksReminders = require('./utils/processPksReminders');
const collectUbx = require('./utils/collectUbx');

(async () => {
    // result: pk, address, reminder
    const arrWalletPksAndReminders = processPksReminders(process.env.PKS_REMINDERS_FROM);

    await collectUbx(arrWalletPksAndReminders, JSON.parse(process.env.WALLETS_TO));
})();
