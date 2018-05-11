#!/bin/bash
set -e # will exit if any command has non-zero exit value
rsync -avm --include='*.js' -f 'hide,! */' ./build/ ./gzip/
rsync -avm --include='*.css' -f 'hide,! */' ./build/ ./gzip/
rsync -avm --include='*.html' -f 'hide,! */' ./build/ ./gzip/
rsync -avm --include='*.json' -f 'hide,! */' ./build/ ./gzip/
rsync -avm --include='*.csv' -f 'hide,! */' ./build/ ./gzip/
# gzip all files in ./gzip/ in place, then rename files to their original name (gzip will add .gz extensions)
find ./gzip -type f -exec gzip -9 {} \; -exec mv {}.gz {} \;
# copy the rest of the files into prod_build directory 
rsync -avm --exclude '*.js' --exclude '*.css' --exclude '*.json' --exclude '*.html' --exclude '*.csv' build/ ./non-gzip/
