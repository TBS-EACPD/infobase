module.exports = {
  "ci": {
    "collect": {
      "url": [
        `https://dev.ea-ad.ca/${process.env.CIRCLE_BRANCH}/index-eng.html#start`
      ]
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}