import common_charts_utils from './common_charts_utils';
import webkitLineClamp from 'webkit-line-clamp';
import { get_static_url } from '../request_utils.js';

// Based on http://bl.ocks.org/brattonc/5e5ce9beee483220e2f6
export class LiquidFillGauge{
  constructor(container, options){
    common_charts_utils.setup_graph_instance(this, d3.select(container), options);
    this.initElements();
  };
  
  initElements(){
    this.graph = this.svg.append("g")
      .attr("class","_graph_area");
    this.replay = this.graph.append("svg:image")
      .attr("xlink:href", get_static_url("svg/replay.svg"))
      .attr("transform", `translate(0,0)`)
      .style("cursor", "pointer");
    this.arcPath = this.graph.append("path");
    this.percentText = this.graph.append("text");
    this.descriptiveText = this.graph.append("text");

    const uniqueId = _.uniqueId("clipWave_");
    this.waveGroup = this.graph.append("defs")
      .append("clipPath")
      .attr("id", uniqueId);
    this.fillCircleGroup = this.graph.append("g")
      .attr("clip-path", `url(#${uniqueId})`);
    
    this.wave = this.waveGroup.append("path");
    this.circle = this.fillCircleGroup.append("circle");
    this.waveText = this.fillCircleGroup.append("text");
    this.waveDescriptiveText = this.fillCircleGroup.append("text");
  }

  render(options){
    this.options = _.extend(this.options,options);
    const waveHeight = this.options.waveHeight || 0.05;
    const waveHeightScale = d3.scaleLinear()
      .range([waveHeight, waveHeight])
      .domain([0,100]);

    const margin = this.options.margin || {
      top: 10,
      right: 0,
      bottom: 0,
      left: 0,
    };

    const width = this.outside_width - margin.left - margin.right;
    const height = this.outside_height - margin.top - margin.bottom;
    
    const radius = Math.min(parseInt(width), parseInt(height))/2;
    const locationX = parseInt(width)/2 - radius;
    let locationY = (parseInt(height) - radius)/22;

    let fillPercent = this.options.value / this.options.totalValue;
    const textValue = parseFloat(fillPercent * 100).toFixed(1);
    const textPixels = (this.options.textSize*radius/2) || (radius/2);
    const descriptiveTextValue = this.options.descriptiveTextValue || "";
    const titleGap = this.options.titleGap || 65;
    const titleClampLines = this.options.titleClampLines || 2;
    const circleThickness = this.options.circleThickness * radius || 0.05 * radius;
    const circleFillGap = this.options.circleFillGap * radius || 0.05 * radius;
    const fillCircleMargin = circleThickness + circleFillGap;
    const fillCircleRadius = radius - fillCircleMargin;
    const waveHeightValue = fillCircleRadius * waveHeightScale(textValue);

    const waveCount = this.options.waveCount || 1;
    const waveLength = fillCircleRadius*2 / waveCount;
    const waveClipCount = 1 + waveCount;
    const waveClipCountModifier = this.options.waveClipModifier || 40;
    const waveClipWidth = waveLength * waveClipCount;

    const outerArcColor = this.options.outerArcColor || window.infobase_color_constants.secondaryColor;
    const circleColor = this.options.circleColor || window.infobase_color_constants.secondaryColor;
    const textColor = this.options.textColor || window.infobase_color_constants.secondaryColor;
    const waveTextColor = this.options.waveTextColor || window.infobase_color_constants.textLightColor;
  
    const textVertPosition = this.options.textVertPosition || 0.5;
    const waveIsFall = this.options.waveIsFall || 1;
    const waveDirection = waveIsFall ? 100: 0;
    const waveRiseFallTime = this.options.waveRiseFallTime || 3600;
    const descriptiveTextAnimateTime = this.options.descriptiveTextAnimateTime || 1000;
    let waveAnimateTime = this.options.waveAnimateTime || 2000;

    // A bit of viz lie: fill upto 1% if it's any lower and make wave animation faster
    fillPercent = fillPercent<0.01 ? 0.01 : fillPercent;
    waveAnimateTime = waveAnimateTime - (10/fillPercent);
    const waveGroupXPosition = fillCircleMargin+fillCircleRadius*2-waveClipWidth;
    const waveRiseScale = d3.scaleLinear()
      .range([fillCircleMargin+fillCircleRadius*2+waveHeightValue,fillCircleMargin-waveHeightValue])
      .domain([0,1]);
    
    const waveAnimateScale = d3.scaleLinear()
      .range([0, waveClipWidth-fillCircleRadius*2])
      .domain([0,1]);


    const textTween = () =>{
      const interpolate_text = d3.interpolate(waveDirection, textValue);
      return function(t) { this.textContent = `${parseFloat(interpolate_text(t)).toFixed(1)}%`; };
    };
    
    const animateWaveRiseFall = () => {
      this.waveGroup.interrupt();
      this.waveGroup.attr('transform',`translate(${waveGroupXPosition},${waveRiseScale(waveIsFall)})`)
        .transition()
        .duration(waveRiseFallTime)
        .attr('transform',`translate(${waveGroupXPosition},${waveRiseScale(fillPercent)})`);
      this.percentText.transition()
        .duration(waveRiseFallTime)
        .tween("text", textTween);
      this.waveText.transition()
        .duration(waveRiseFallTime)
        .tween("text", textTween);
      this.descriptiveText
        .attr("font-size", `0px`)
        .transition()
        .delay(waveRiseFallTime-waveRiseFallTime/5)
        .transition()
        .duration(descriptiveTextAnimateTime)
        .attr("font-size", `${textPixels/4}px`);
      this.waveDescriptiveText
        .attr("font-size", `0px`)
        .transition()
        .delay(waveRiseFallTime-waveRiseFallTime/5)
        .transition()
        .duration(descriptiveTextAnimateTime)
        .attr("font-size", `${textPixels/4}px`);
    };

    if(this.options.title){
      locationY = locationY + titleGap;
      this.outside_height = this.outside_height + titleGap;
      const titleContainer = this.html.append("div")
        .attr("class", "title center-text")
        .styles({
          "font-size": `${textPixels/2}px`,
          "position": "absolute",
          "font-weight": "500",
          "left": `${margin.left}px`,
          "top": `0px`,
          "width": `${width}px`,
        });
      const titleDiv = titleContainer.append("div")
        .styles({"width": "80%","margin": "auto"})
        .html(this.options.title);
      webkitLineClamp(titleDiv._groups[0][0], titleClampLines);
    };
    this.graph
      .attr("transform", `translate(${locationX},${locationY})`);
    this.replay
      .on("click", (() => {
        animateWaveRiseFall();
      }));

    this.svg
      .attr("width", this.outside_width)
      .attr("height", this.outside_height);

    const arc = d3.arc()
      .startAngle(0)
      .endAngle(360)
      .innerRadius(radius)
      .outerRadius(radius+5);

    this.arcPath
      .attr("d", arc)
      .attr("transform", `translate(${radius},${radius})`)
      .style("fill", outerArcColor);

    const textRiseScaleY = d3.scaleLinear()
      .range([fillCircleMargin+fillCircleRadius*2,(fillCircleMargin+textPixels*0.7)])
      .domain([0,1]);
  
    this.percentText
      .text(`${textValue}%`)
      .attr("text-anchor", "middle")
      .attr("font-size", `${textPixels}px`)
      .style("fill", textColor)
      .attr('transform',`translate(${radius},${textRiseScaleY(textVertPosition)})`);
    this.descriptiveText
      .text(descriptiveTextValue)
      .attr("text-anchor", "middle")
      .attr("font-size", `0px`)
      .style("fill", textColor)
      .attr('transform',`translate(${radius},${textRiseScaleY(textVertPosition-0.15)})`);
  
    const waveScaleX = d3.scaleLinear().range([0,waveClipWidth]).domain([0,1]);
    const waveScaleY = d3.scaleLinear().range([0,waveHeightValue]).domain([0,1]);
    const clipArea = d3.area()
      .x((d) => waveScaleX(d.x) )
      .y0((d) => waveScaleY(Math.sin(d.y*2*Math.PI)) )
      .y1(() => (fillCircleRadius*2 + waveHeightValue) );

    const data = _.chain(waveClipCountModifier*waveClipCount + 1)
      .range()
      .map(
        ix => ({
          x: ix/(waveClipCountModifier*waveClipCount),
          y: ix/waveClipCountModifier,
        }) 
      )
      .value();

    this.wave
      .datum(data)
      .attr("d", clipArea)
      .attr("T", 0);

    this.circle
      .attr("cx", radius)
      .attr("cy", radius)
      .attr("r", fillCircleRadius)
      .style("fill", circleColor);
    this.waveText
      .text(`${textValue}%`)
      .attr("text-anchor", "middle")
      .attr("font-size", `${textPixels}px`)
      .style("fill", waveTextColor)
      .attr('transform', `translate(${radius},${textRiseScaleY(textVertPosition)})`);
    this.waveDescriptiveText
      .text(descriptiveTextValue)
      .attr("text-anchor", "middle")
      .attr("font-size", `0px`)
      .style("fill", waveTextColor)
      .attr('transform',`translate(${radius},${textRiseScaleY(textVertPosition-0.15)})`);




    const animateWave = () => {
      this.wave.attr('transform',`translate(${waveAnimateScale(this.wave.attr('T'))},0)`);
      this.wave.transition()
        .duration(waveAnimateTime * (1-this.wave.attr('T')))
        .ease(d3.easeLinear)
        .attr('transform',`translate(${waveAnimateScale(1)},0)`)
        .attr('T', 1)
        .on('end', (() => {
          this.wave.attr('T', 0);
          animateWave(waveAnimateTime);
        }));
    };

    animateWaveRiseFall();
    animateWave();

    return this;
  };
}