# ubix-earnings

A cron script to collect earnings from the different projects to the one wallet

# Sample .env file to collect coins from several accounts to one wallet

```
NODE_ENV=Devel
MAIN_PROJECT_WALLET=111111111111111111111111111111
WALLET_PKS_REMINDERS=[["111111111111111111111111111111111111111111111111", 12e5], ["22222222222222222222222222222222222222222222", 12e5]]
```

##### MAIN_PROJECT_WALLET - target wallet address

##### WALLET_PKS_REMINDERS - array of [[PK,WALLET_REMINDER]]

##### Add node ./index.js call to crontab with any interval
