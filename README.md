# InfoBase Mono-Repo

[![CircleCI](https://circleci.com/gh/TBS-EACPD/InfoBase.svg?style=svg&circle-token=a99b6b8309e5edd904b0386c4a92c10bf5f43e29)](https://circleci.com/gh/TBS-EACPD/InfoBase)

TODO: write a root level readme (and maybe update /client/README.md abd /server/README.md, they're probably outdated ATM)

-------------------------------------------------------------------------------------------------------------------------------
						
## Unoffical guide

**Terminal 1**  
> Directory: InfoBase/client  
> `npm ci`  
> `npm run IB_base`  
> `npm run IB_q_both`

**Terminal 2**  
> Directory: InfoBase/client  
> `npm run serve-loopback`

**Terminal 3**  
> Directory: InfoBase/server  
> `mongod`  
	if errors occurs, kill the already running instance from activity monitor
		
**Terminal 4**  
> Directory: InfoBase/server  
> `npm ci`  
> `npm run populate_db`  
> `npm run start`
