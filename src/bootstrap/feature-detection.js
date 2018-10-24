if (typeof window !== "undefined"){
  // feature detection
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
  // end of feature detection

  // shim for classList on IE11 svgs
  if (!('classList' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'classList', {
      get() {
        return {
          contains: className => {
            return this.className.baseVal.split(' ').indexOf(className) !== -1
          },
        }
      },
    })
  }
}  