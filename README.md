# ubix-earnings

A cron script to collect earnings from the different projects to the one wallet

# Sample .env file to collect coins from several accounts to one wallet

```
NODE_ENV=Devel
WALLETS_TO=[["111111111111111111111111111111", 30], ["222222222222222222222222222222222", 100]]
PKS_REMINDERS_FROM=[["22222222222222222222222222222222222222222222", 10e5]]
TRANSFER_FEE=4000

```

##### WALLETS_TO - array target wallet address + percent to send, for instance, all money to 1 wallet:

```
WALLETS_TO=[["111111111111111111111111111111", 100]]
```

##### split 30 / 70% (30 to first wallet, the rest 100% (70% from original to another) )

```
WALLETS_TO=[["111111111111111111111111111111", 30], ["222222222222222222222222222222222", 70]]
```

##### PKS_REMINDERS_FROM - array of [[PK,WALLET_REMINDER]]

##### Add node ./index.js call to crontab with any interval
