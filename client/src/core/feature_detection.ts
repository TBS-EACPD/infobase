const is_mobile = function () {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || matchMedia("(max-width: 970px)").matches
  );
};

const has_local_storage = (function () {
  const blah = "blah";
  try {
    localStorage.setItem(blah, blah);
    localStorage.removeItem(blah);
    return true;
  } catch (e) {
    return false;
  }
})();

const download_attr = "download" in document.createElement("a");
const binary_download = typeof ArrayBuffer !== "undefined";

export { is_mobile, has_local_storage, download_attr, binary_download };
