// Not bundled, copied in to build dir by copy_static_assets.js and directly rquested by a script in the index html files
// As such, written in vanilla JS and somewhat prioritizing compactness over readability
// Also run through Handlebars with the same template data as corresponding index html files 
(function(){
  const sha = window.static_content_deploy_sha || Math.random();

  const files_to_preload = [
    {
      path: "{{CDN_URL}}/lookups_{{lang}}.json.js",
      as: "fetch",
      non_a11y: "false",
    },
  ];

  var has_preload_support = (function() { try { return document.createElement("link").relList.supports('preload'); } catch(e) { return false; }}());
  if (has_preload_support){
    var preload_link_container = document.createElement("div");
    var preload_links = "";
    for (var i = 0; i < files_to_preload.length; i++){
      if (files_to_preload[i].non_a11y === "{{is_a11y_mode}}"){
        preload_links += '<link rel="preload" href="'+files_to_preload[i].path+'?v='+sha+'" as="'+files_to_preload[i].as+'">';
      }
    }
    preload_link_container.innerHTML = preload_links;
    document.head.appendChild(preload_link_container);
  }
})(); 