set -e 

npm set prefix ~/.npm
PATH="$HOME/.npm/bin:$PATH"
PATH="./node_modules/.bin:$PATH"

npm install @axe-core/cli -g

axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#start --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#compare_estimates --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#igoc --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#treemap --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#tag-explorer --disable color-contrast --exit
axe "$CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#rpb/.-.-(subject.-.-'gov_gov.-.-columns.-.-false)" --disable color-contrast --exit
axe "$CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#rpb/.-.-(table.-.-'orgVoteStatQfr.-.-subject.-.-'gov_gov.-.-columns.-.-(.-.-'thisyearauthorities.-.-'thisyear_quarterexpenditures.-.-'thisyearexpenditures.-.-'lastyearauthorities.-.-'lastyear_quarterexpenditures.-.-'lastyearexpenditures))" --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#lab --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#diff --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#glossary --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#metadata --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#about --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#faq --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#contact --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/gov/gov/infograph/intro --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/gov/gov/infograph/financial --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/gov/gov/infograph/people --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/gov/gov/infograph/results --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/gov/gov/infograph/related --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/gov/gov/infograph/all_data --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/dept/1/infograph/intro --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/dept/1/infograph/financial --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/dept/1/infograph/people --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/dept/1/infograph/results --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/dept/1/infograph/related --disable color-contrast --exit
axe $CDN_BASE_URL/$CIRCLE_BRANCH/index-eng.html#orgs/dept/1/infograph/all_data --disable color-contrast --exit
