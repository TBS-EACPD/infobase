module.exports = {
  process(src, filename, config, options) {
    //returns content of file as javascript string
    //useful if we have a module that just wants a file's string contents, like when we put a csv through d3's csv parser
    return `module.exports = ${JSON.stringify(src)};`;
  },
};
