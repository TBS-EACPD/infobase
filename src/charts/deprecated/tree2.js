$(function(){
  var charts_index = ns('charts_index');
  var TREE = ns('charts_index.TREE');

  TREE.make_horizontal_tree2 = charts_index.extend_base(function(svg, index){
    var text_func = this.text_func;
    var dispatch  = this.dispatch;
    var root = this.root;
    var height = this.height;
    var width = this.width;
    var maxLabelLength  = 100;
    var translate=[0,30], scale=1;
    var font_size = 16;
    var bar_height = 30;
    var bar_margin = 5;
    var bar_width = 500;
    var current_node;

    var html = d3.select(charts_index.get_html_parent(svg));

    // set the tree layout assuming an initial size of 300 width and 200
    // height
    // *** this function assumes the tree will be laid out vertically, 
    // therefore the x,y coordinates will be flipped to make it a horizontal
    // tree
    var tree = d3.layout.tree()
      .nodeSize([0, 20]);

    // setup the svg element, provide lots of space for expansion
    // all the extra space will be invisible and empty initially
    svg
      .attr("width", 2000)
      .attr("height", 2000);
    var vis = svg
      .append("g")
      .attr("transform", "translate("+translate+")"); 
    
    var nodes_layer = vis.append("g").attr("class","nodes");

    // create the links
    // diagonal, will be called when the links are drawn and will calculate
    // a nice smooth path based on the starting and ending coordinates
    // 1 - set up the diagonal function which
    // sweaps the x,y coordinates
    var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });
                     

    // Toggle children.
    var toggle = function (d) {

      if (d === root){
        var collapse_all = function(node){
          if (node.children){
            _.each(node.children,collapse_all);
            node._children = node.children;
            node.children = null;
          }
        };
        collapse_all(d);
      }// else if (current_node !== d && current_node.depth >= d.depth){
      // current_node._children = current_node.children;
      // current_node.children = null;
      //
      if (d.children ) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    };
    
    // this will create a green path from the currently clicked node
    // back to the source
    var walk_back_up_tree = function(d,child){
      if (d === undefined){
        return;
      }
      var filter_func = function(_d){
        return _d === d;
      };

      svg.selectAll("g.node rect.node")
        .filter(filter_func)
        .style({
          "fill-opacity":  1,
          "fill": function(_d){
            if (_d === root && child){
              return child.color;
            } else if (_d.color){
              return _d.color;
            } else {
              return "#CCC";
            }
          },
        });
        
      html.selectAll("div.label a")
        .filter(filter_func)
        .style("font-weight","500");

      setTimeout(function(){
        walk_back_up_tree(d.parent,d);
      },200);
    };

    var update = function(updated) {
      current_node = updated;
      //get a list of all the active nodes from the now 
      // out of date tree
      // now recompute the layout with the new, relaxed layout
      var nodes = tree.nodes(root);
      var html_height = Math.max(height,
        (nodes.length+1)*(bar_height+bar_margin)+30 
      );
      html.style("height",html_height+"px");
      _.each(nodes, function(node,i){
        node.x = (bar_height+bar_margin)*i;
        node.index = i;
      });
      // signal the recently select node along with all open nodes 
      dispatch.dataClick(updated, nodes);

      // create the svg:g which will hold the circle
      // and text
      var g_nodes = nodes_layer.selectAll("g.node")
        .data(nodes,function(d){return d.id;});

      g_nodes
        .exit()
        .transition()
        //.duration(1000)
        .attr({
          "transform" :  function(d) { return "translate(" + d.parent.y + "," + d.parent.x + ")"; },
        })
        .remove();

      var new_nodes = g_nodes.enter()
        .append("g")
        .attr({
          "class": "node",
          "transform" :  function(d) { return "translate(" + updated.y + "," + updated.x + ")"; },
        });

      g_nodes
        .transition()
        //.duration(1000)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

      // create the actual nodes
      new_nodes.append("rect")
        .attr("class","node")
        .attr({
          "width": function(d){
            return bar_width - d.depth*20;
          },
          "height": bar_height,
          "ry" : 5,
          "rx" : 5,
        });

      new_nodes
        .filter(function(d){
          return d.child_count > 0 && d !== root;
        })
        .append("text")
        .style({ "font-weight" : 500 })
        .attr({
          "y" : bar_height/2+5,
          "x" : function(d){
            return bar_width - d.depth*20 - 20;
          },
        });

      svg.selectAll("g.node").selectAll("text")
        .text(function(d){
          return _.isUndefined(d.children) ? "+" : "-";
        });
          
      // for all nodes currently drawn
      svg.selectAll("rect.node")
        .style({
          "stroke" : "none",
          "fill-opacity" : 0.3,
          "fill" : function(d){
            if (d.color) {
              return d.color;
            } else if (d.parent && d.parent.color) {
              d.color = d.parent.color;
              return d.color;
            }
            else if (d.child_count === 0) {
              return "#808080";  // grey
            }
            return "#CCC";//"#8080FF";  // blue
          },
        });

      // the invisible circles which  provide the hover effect
      // and act as a larger target area for accepting clicks
      var new_rects = new_nodes.append("rect")
        .attr({
          "y"  : -3,
          "x"  : -3,
          "ry" : 5,
          "rx" : 5,
          "width": function(d){
            return bar_width - d.depth*20 + 6;
          },
          "height" : bar_height + 6,
        })
        .style({
          "pointer-events": "all",
          "stroke" : "none",
          "fill" : "#CCC",
          "fill-opacity" : "0",
        })
        .on("click",toggle);

      if (!is_mobile){
        new_rects
          .on("mouseenter", function(){
            d3.select(this).style("fill-opacity",0.5);
          })
          .on("mouseleave", function(){
            d3.select(this).style("fill-opacity",0);
          });
      }

      var labels = html.selectAll("div.label")
        .data(nodes,function(d){return d.id;});
      // this slectAll will copy any changed data down from the div.label
      // to the anchor elements
      d3.selectAll("div.label").selectAll("a");

      labels.exit().remove();

      var new_labels = labels
        .enter()
        .append("div")
        .attr("class","label");

      new_labels
        .append("a")
        .attr("href","#")
        .attr("class","wrap-none")
        .style({
          "opacity" : 1,
          "color" : "#000",
          "text-decoration" : "none",
        })
        .on("click", function(d){
          toggle(d);
          setTimeout(function(){
            html.selectAll("a")
              .filter(function(_d){return _d === d;})
              .node()
              .focus();
          });
        })
        .html(text_func);

      html.selectAll("div.label")
        .style({
          "top" : function(d){ 
            return scale*(d.x+translate[1]+4)+"px"; 
          },
          "left" : function(d){ 
            return scale*(d.y+translate[0]+4)+"px"; 
          } ,
          "padding" : "1px",
          "height" : bar_height +"px",
          "border-radius" : "5px",
          "font-size" : font_size + "px",
          "text-align" : "left",
          "position": "absolute",
        })
        .sort(function(x,y){
          return x.index > y.index ? 1 :-1 ;
        });

      html.selectAll("div.label a")
        .style("font-weight","300");

      //position(updated);

      setTimeout(function(){
        walk_back_up_tree(updated);
      },200);

    };

    html.style({
      "margin" : "20px",
      "border" : "1px #CCC solid",
      "background-color": "rgba(204, 204, 204,0.1)",
      "height" : height+"px",
      overflow : "hidden",
    });

    root.children = root._children;
    root._children = null;

    update(root);
  });
});
