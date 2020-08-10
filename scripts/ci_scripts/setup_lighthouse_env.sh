set -e

echo $(npm install -g heroku)
echo $(npm install @lhci/cli@^0.4.4)
echo $(apt-get update)
echo $(apt-get -y install postgresql)