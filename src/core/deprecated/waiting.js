(function() {
//big change: This module will make HEAD requests to get the file lengths.
//It's only done in this module because it's part of the vis, and because the alternative
// is to do it from both InfoBase.js and base_tables.js

  var APP=reququire("./../app.js");
  var WAIT=ns("WAIT");
  var twoPi = 2*Math.PI;

  WAIT.getContentSizes = function(reqs,sizes){

    var proms = _.map(reqs,function(obj,key){
      var helperProm = $.Deferred();
      //Want the done() for the ajax to be called first, so make a promise just for it.

      var prom = $.ajax({
        type:"HEAD",
        url:obj.url,
      }).done(function(a,b,jqXHR){
        var item = {
          id:key,
          contentSize :  jqXHR.getResponseHeader('content-length'),
        };
        sizes.push(item);
        helperProm.resolve(key);
      });


      return helperProm;
    });
    return $.when.apply(null,_.values(proms));
  };


  WAIT.waitscreen = function(lang,msg){
    return new waitscreen(lang,msg);
  };
  //Initialize the view
  var waitscreen = function(lang,msg){
    
    this.lang = lang;
    this.vis = d3.select("#app")
      .append("div")
      .style({
        "z-index":100,
        "background-color": "#FFF",
      })
      .attr("class","span-4 loader")
      .append("svg")
      .attr({
        "width" : "800px",
        "height" : "800px",
      });

    this.height = 400;
    this.width = 400;
    this.total = 0;
    this.loaded = 0;
    this.formatPercent = d3.format(".0%");

    this.arc = d3.svg.arc()
      .startAngle(0)
      .innerRadius(75)
      .outerRadius(170);

    this.vis.attr("width", this.width)
      .attr("height", this.height)
      .attr('fill', '#2E7AF9')
      .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.meter = this.vis.append("g")
      .attr("class", "progress-meter")
      .attr("transform", "translate("+this.width/2+","+this.height/2+")");

    this.meter.append("path")
      .attr("class", "background")
      .attr("d", this.arc.endAngle(twoPi))
      .attr("style", "fill:#DFEAFD");

    this.foreground = this.meter.append("path")
      .attr("class", "foreground")
      .attr("style","fill:rgb(62, 151, 171)");

    this.text = this.meter.append("text")
      .attr("text-anchor", "middle");

    this.text2 = this.meter.append("text")
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "text2")
      .text(msg);

  };
    //
  waitscreen.prototype.initRequestInfo = function(requests){
    this.total = 0;
    this.items = {};


    _.each(requests, function(obj,key){
      var objSize = parseInt(obj.contentSize);
      this.total += objSize;
      this.items[obj.id]= {downloaded:0,size:objSize};
    },this);

  };

  waitscreen.prototype.updateView = function(){
    var progress = this.loaded/this.total,
      formatPercent = this.formatPercent,
      loaded = this.loaded,
      total = this.total,
      arc = this.arc,
      text = this.text,
      self = this;

    _.defer(function(){
      self.foreground.attr("d",arc.endAngle(twoPi*progress));
      self.text.text(formatPercent(progress));
    });
  };

  waitscreen.prototype.update_item = function(key,amt){
    this.items[key].downloaded = amt;
    var sum = _.reduce(this.items, function(memo, obj){ return memo + obj.downloaded; }, 0);
    this.loaded = sum;
    this.updateView();
  };
  waitscreen.prototype.teardown = function(){
    d3.select("div.loader").remove();
    this.items = {};
    this.loaded = this.total = this.progress = 0;
  };

})();
