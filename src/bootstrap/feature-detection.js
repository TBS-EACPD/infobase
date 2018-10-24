if (typeof window !== "undefined"){
  window.is_IE = function() {
    var myNav = navigator.userAgent.toLowerCase();
    return (
      (myNav.indexOf('msie') !== -1) ? 
        parseInt(myNav.split('msie')[1]) : 
        myNav.indexOf('trident') !== -1
    );
  };

  window.is_mobile = function(){
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 970px)").matches
    );
  }

  window.has_local_storage = (function(){
    const blah = "blah";
    try {
      localStorage.setItem(blah, blah);
      localStorage.removeItem(blah);
      return true;
    } catch(e) {
      return false;
    }
  })()

  window.windows_os = navigator.appVersion.indexOf("Win") !== -1;

  window.details = 'open' in document.createElement('details');
  window.download_attr = 'download' in document.createElement('a');
  window.clipboard_access = 'clipboardData' in window;
  window.binary_download = typeof ArrayBuffer !== 'undefined';
}  