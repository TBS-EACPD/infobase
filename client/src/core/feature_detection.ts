const is_IE = function () {
  const user_agent = navigator.userAgent.toLowerCase();
  return user_agent.indexOf("msie") !== -1
    ? parseInt(user_agent.split("msie")[1])
    : user_agent.indexOf("trident") !== -1;
};

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

export { is_IE, is_mobile, has_local_storage, download_attr, binary_download };
