## Developing for the InfoBase

* Git hooks are automatically managed by the npm package `husky`. It will automatically install after the first `npm ci` run and you won't have to worry about it anymore.
  * the most important hook is the pre-push hook. Non-public branch names start with a double underscore (__), and the pre-push hook prevents you from pushing them to the default `origin` remote by accident
  * Prettier will also run automatically prior to a push and will let you know if you have to format your files
* You'll need at least 5 terminal windows open (or one window tmux'ed in to five regions, recommended approach is to just run `npm run tmux_env` from the repo root, it does this all auto-magically)
  * One for a web server (running `npm run serve-loopback` in the background)
  * One for a local copy of the mongo database (running `npm run mongod`)
  * Two running the backend (from `InfoBase/server` run `npm run populate_db:watch` and `npm run start` which will keep running the background)
  * One for a webpack/etc build (`IB_base_watch`)
  * One for a build script, e.g. `IB_q_both` (running on watch, but regularly checked for linter warnings and webpack errors)
  * One for active use with git, npm, grep, etc.
* Use VS Code, install the Prettier extension. This will reformat your code on save. Note that prior to each push, prettier will run automatically and warn you if there are non-prettier compliant files
* Use Chrome for prototyping; the Chrome dev tools are still the most friendly option
  * Disable cacheing: open a dev tools window, in the "Network" tab check the "Disable cache" option
* Testing in IE (still a significant target platform) and on mobile (sees limited use, but that's probably because we don't give it enough care in the first place)
  * How?
    * switch your server from `npm run serve-loopback` to `npm run serve`
    * switch your build script from `IB_q_both` to `IB_dev`
    * get your Mac's IP address (Wifi on menu-bar -> Open network preferences -> should find address displayed in top half of screen)
    * connect your windows laptop/mobile device to the same network as your Mac
    * visit `http://<Mac's IP>:8080/build/InfoBase/index-eng.html#start` from your target device
  * Alternatively, if you've pushed your branch and given CI time to run, then you can visit and share a dev link at `https://dev.ea-ad.ca/<branch name>/index-eng.html`. As long as all tests are passing, these dev links are updated whenever you push to their corresponding remote branches! ... it is important that the branch name be URL safe/valid 
  * Regularly test in IE and mobile to make sure you're not using unsupported technology and that your CSS displays as expected cross-platform! If you're using a piece of web technology you haven't used before, check its MDN page's support grid, or look it up on [caniuse.com](https://caniuse.com/) (support in IE 11 and all modern browsers is sufficient)

## Production deployment

Pre-requisites: Install everything needed to develop the InfoBase **plus** the LastPass CLI. You also need access to the relevant LastPass account.

Deploying to prod:
* Make sure you're on a fully merged, up-to-date, and deployment-ready version of master
* In project root, run `npm run prod_deploy`, input the LastPass password when prompted
  * If a deploy is made in error, or is somehow broken, you can roll back to the previous deploy by running `npm run prod_rollback`. The only version available for rollback is the version that was live prior to the most recent deploy. Running the rollback script a second time will put what you just rolled back **back** in to production!

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