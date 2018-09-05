# If CLOUDFLARE_KEY isn't set, try and get it from the (root owned) file in home
if [ -z "$CLOUDFLARE_KEY" ]
  then
    CLOUDFLARE_KEY = $(sudo cat "${HOME}/cloudflare_key.txt")
fi

# use Cloudflare API to clear cache on files with no cache busting
curl -X POST "https://api.cloudflare.com/client/v4/zones/023e105f4ecef8ad9ca31a8372d0c353/purge_cache" \
  -H "X-Auth-Email: eaadinbox@gmail.com" \
  -H "X-Auth-Key: ${CLOUDFLARE_KEY}" \
  -H "Content-Type: application/json" \
  --data "{\"files\":[\"${CDN_URL}/favicon.ico\",\"${CDN_URL}/app/extended-bootstrap.css\",\"${CDN_URL}/svg/sig-blk-en.svg\",\"${CDN_URL}/svg/sig-blk-fr.svg\",\"${CDN_URL}/svg/wmms-blk.svg\"]}"
