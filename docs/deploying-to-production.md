## Production deployment

Pre-requisites:
  * install everything needed to develop the InfoBase
  * install the LastPass CLI
    * have a LastPass account with access to the relevant keys
    * log in as this account with `lpass login <email>`, input password and 2FA code

Deploying to prod:
* Make sure you're on a fully merged, up-to-date, and deployment-ready version of master
* In the project root, run `npm run prod_deploy`
* 

If a deploy is made in error, or is somehow broken, you can roll back to the previous deploy by running `npm run prod_rollback`. The only version available for rollback is the version that was live prior to the most recent deploy. Running the rollback script a second time will put what you just rolled back **back** in to production!

Other notes:
* Client deploy life-cycle
  * There are three directories on our production google bucket: one for staging, one for prod, and one for the rollback version. The deploy script follows these steps:
    1) run a prod build locally, push these files (relatively slowly) to the bucket's staging dir
    2) within the bucket, copy the current prod dir over the rollback dir
    3) within the bucket, copy the current staging dir over the prod dir
  * copying within the bucket is far faster than pushing to the bucket from a dev machine (meaning the production site is unstable for a much shorter period), and also has a much smaller chance to ever be interrupted part-way. 
* CORS:
  * The app needs to make cross domain requests. This must be allowed on both ends
    * client: `fetch` api with `{ mode: "cors" }` 
    * server: setting cors on the bucket [exactly as in this SO answer](https://stackoverflow.com/questions/43109327/cors-setting-on-google-cloud-bucket)
  * The cors config is in a json file and is close enough to secret that we keep it in LastPass. Edits can be made there, and they can be reapplied with `client/deploy_scripts/set_bucket_cors.sh`

TODO: 
  * document mongodb life-cycle
  * GraphQL google cloud func
  * separate deploy process for the email_backend