module.exports = function (src) {
  this.cacheable();

  const str = `
    ${src}
    window.add_text_bundle(module.exports);
  `;
  return str;
};
