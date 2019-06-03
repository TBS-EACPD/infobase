import common_charts_utils from './common_charts_utils';

export class LiquidFillGauge{
  constructor(container, options){
    common_charts_utils.setup_graph_instance(this, d3.select(container), options);
  };

  render(options){
    this.options = _.extend(this.options,options);
    var waveHeight = this.options.waveHeight || 0.05
    var waveHeightScale = d3.scaleLinear()
      .range([waveHeight, waveHeight])
      .domain([0,100]);

    var margin = this.options.margin || {top: 10,
      right: 0,
      bottom: 0,
      left: 0};

    var width = this.outside_width - margin.left - margin.right;
    var height = this.outside_height - margin.top - margin.bottom;
    
    var radius = Math.min(parseInt(width), parseInt(height))/2;
    var locationX = parseInt(width)/2 - radius;
    var locationY = (parseInt(height) - radius)/22;

    var fillPercent = this.options.value / this.options.totalValue;
    var textValue = parseFloat(fillPercent * 100).toFixed(1);
    var textPixels = (this.options.textSize*radius/2) || (radius/2);
    var titleGap = this.options.titleGap || 20;
    var circleThickness = this.options.circleThickness * radius || 0.05 * radius;
    var circleFillGap = this.options.circleFillGap * radius || 0.05 * radius;
    var fillCircleMargin = circleThickness + circleFillGap;
    var fillCircleRadius = radius - fillCircleMargin;
    var waveHeightValue = fillCircleRadius * waveHeightScale(textValue);

    var waveCount = this.options.waveCount || 1
    var waveLength = fillCircleRadius*2 / waveCount;
    var waveClipCount = 1 + waveCount;
    var waveClipWidth = waveLength * waveClipCount;

    var outerArcColor = this.options.outerArcColor || window.infobase_color_constants.secondaryColor;
    var circleColor = this.options.circleColor || window.infobase_color_constants.secondaryColor;
    var textColor = this.options.textColor || window.infobase_color_constants.secondaryColor;
    var waveTextColor = this.options.waveTextColor || window.infobase_color_constants.textLightColor;
  
    var textVertPosition = this.options.textVertPosition || 0.5;
    var waveIsFall = this.options.waveIsFall || 1;
    var waveDirection = waveIsFall ? 100:0;
    var waveRiseTime = this.options.waveRiseTime || 2200
    var waveAnimateTime = this.options.waveAnimateTime || 2400

    if(this.options.title){
      locationY = locationY + titleGap;
      this.outside_height = this.outside_height + titleGap;
      this.html.append("div")
        .attr("class", "title center-text")
        .styles({
          "font-size": textPixels/2 + "px",
          "position": "absolute",
          "font-weight": "500",
          "left": margin.left+"px",
          "top": `-${titleGap}px`,
          "width": width+"px",
        })
        .append("div")
        .styles({"width": "80%","margin": "auto"})
        .html(this.options.title);
    };


    this.graph = this.svg.append("g")
      .attr("class","_graph_area")
      .attr("transform", `translate(${locationX},${locationY})`);

    this.svg
      .attr("width", this.outside_width)
      .attr("height", this.outside_height)
      .on("click", function(){
        animateWaveFall();
      })

    var arc = d3.arc()
      .startAngle(0)
      .endAngle(360)
      .innerRadius(radius)
      .outerRadius(radius+5);

    this.graph.append("path")
      .attr("d", arc)
      .attr("transform", `translate(${radius},${radius})`)
      .style("fill", outerArcColor);

    var textRiseScaleY = d3.scaleLinear()
      .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
      .domain([0,1]);
    const textTween = function(){
      var i = d3.interpolate(waveDirection, textValue);
      return function(t) { this.textContent = `${parseFloat(i(t)).toFixed(1)}%`; }
    };
  
    var text = this.graph.append("text")
      .text(`${textValue}%`)
      .attr("text-anchor", "middle")
      .attr("font-size", textPixels + "px")
      .style("fill", textColor)
      .attr('transform','translate('+radius+','+textRiseScaleY(textVertPosition)+')');
  
    var waveScaleX = d3.scaleLinear().range([0,waveClipWidth]).domain([0,1]);
    var waveScaleY = d3.scaleLinear().range([0,waveHeightValue]).domain([0,1]);
    var clipArea = d3.area()
      .x(function(d) { return waveScaleX(d.x); } )
      .y0(function(d) { return waveScaleY(Math.sin(d.y*2*Math.PI));} )
      .y1(function(d) { return (fillCircleRadius*2 + waveHeightValue); } );

    var data = [];
    for(var i = 0; i <= 40*waveClipCount; i++){
      data.push({x: i/(40*waveClipCount), y: (i/(40))});
    }
    const uniqueId = _.uniqueId("clipWave_");
    var waveGroup = this.graph.append("defs")
      .append("clipPath")
      .attr("id", uniqueId);
    var wave = waveGroup.append("path")
      .datum(data)
      .attr("d", clipArea)
      .attr("T", 0);

    var fillCircleGroup = this.graph.append("g")
      .attr("clip-path", `url(#${uniqueId})`);
    var circle = fillCircleGroup.append("circle")
      .attr("cx", radius)
      .attr("cy", radius)
      .attr("r", fillCircleRadius)
      .style("fill", circleColor);
    var waveText = fillCircleGroup.append("text")
      .text(`${textValue}%`)
      .attr("text-anchor", "middle")
      .attr("font-size", textPixels + "px")
      .style("fill", waveTextColor)
      .attr('transform','translate('+radius+','+textRiseScaleY(textVertPosition)+')');
    var waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
    var waveRiseScale = d3.scaleLinear()
      .range([fillCircleMargin+fillCircleRadius*2+waveHeightValue,fillCircleMargin-waveHeightValue])
      .domain([0,1]);
    
    var waveAnimateScale = d3.scaleLinear()
      .range([0, waveClipWidth-fillCircleRadius*2])
      .domain([0,1]);

    animateWaveFall();
    animateWave();

    function animateWaveFall(){
      text.transition()
        .duration(waveRiseTime)
        .tween("text", textTween);
      waveText.transition()
        .duration(waveRiseTime)
        .tween("text", textTween);
      waveGroup.attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(waveIsFall)+')')
        .transition()
        .duration(waveRiseTime)
        .attr('transform','translate('+waveGroupXPosition+','+waveRiseScale(fillPercent)+')')
    }
    
    function animateWave() {
      wave.attr('transform','translate('+waveAnimateScale(wave.attr('T'))+',0)');
      wave.transition()
        .duration(waveAnimateTime * (1-wave.attr('T')))
        .ease(d3.easeLinear)
        .attr('transform','translate('+waveAnimateScale(1)+',0)')
        .attr('T', 1)
        .on('end', function(){
          wave.attr('T', 0);
          animateWave(waveAnimateTime);
        });
    };
    

    return this;
  };
}