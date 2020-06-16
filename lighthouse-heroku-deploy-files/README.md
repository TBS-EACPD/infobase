## How to deploy on Heroku
1. Add heroku remote (`git remote add heroku https://git.heroku.com/infobase-lhci.git`)
2. `git remote -v` and ensure you have
    heroku	https://git.heroku.com/infobase-lhci.git (fetch)
    heroku	https://git.heroku.com/infobase-lhci.git (push)
3. Move `Procfile` and `server.js` to root folder of the project
4. Add and commit your changes (`git add ...` and `git commit -m '...'`)
5. Deploy your Heroku changes (`git push heroku branch_name:master -f`)
6. When finished, move `Procfile` and `server.js` back to `./lighthouse-heroku-deploy-files` sub directory
7. Push your changes to origin (normal git stuff)
8. Done!