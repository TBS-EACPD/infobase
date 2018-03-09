//
// a custom stacking layout which allows for negative values 
// to be stacked
module.exports = exports = function barStack(data) {
  var l = data[0].data.length;
  var posBase; 
  var negBase;
  while (l--) {
    posBase = 0; 
    negBase = 0;
    _.each(data, function(d) {
      d = d.data[l];
      d.size = Math.abs(d.y);
      if (d.y < 0)  {
        d.y0 = negBase;
        negBase -= d.size;
      } else { 
        // The Math.round function is to adjust for very very small numbers(round-off error)
        // Totals in the stack bar should equate to 1, not 0.99999999999999
        d.y0 = posBase = Math.round((posBase + d.size)*10000)/10000;
      } 
    });
  }
  data.extent= d3.extent(
    d3.merge(
      d3.merge(
        data.map(function(e) { 
          return e.data.map(function(f) { 
            return [f.y0,f.y0-f.size];
          });
        })
      )
    )
  )
  return data;
}

