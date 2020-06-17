set -e

echo $(npm install -g heroku)
echo $(npm install @lhci/cli@^0.4.1)
echo $(apt-get install postgresql-client)