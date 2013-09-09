
var board, N, fn, fn, timeout, last_on, point_name = null,
    elapsedSeconds_on = 0,
    dataArray = [],
    dataX = [0],
    dataY = [0];

CalculusGraph = {

  start: function(animation_timeout){
    this.setup('box');
    //this.sketch(fn);
    this.plot();

    timeout = animation_timeout;
  },
  setup: function(targetID) {
      board = JXG.JSXGraph.initBoard(targetID, {
                                            boundingbox:[-11,11,11,-11],
                                            axis:true, 
                                            keepaspectratio:true,
                                            showCopyright: false
                                  });
           
     
  },

  updateData: function(m, x, c){

    
    y = m*x +c;
    fn = function(t){ return m*t +c; };

    dataX.push(x);
    dataY.push(y);

    board.update();
  },

 point: function(x, y, point_name){

  //board.create('curve',[x, y],{strokeColor:'blue',strokeWidth:1,dash:1});
   //board.create('curve', [x,  y], {strokeColor:'blue',strokeWidth:1,dash:1});
 },

  plot: function() {
  
      
    
    
   

   /* var graph = board.create('curve', 
                                      [[0],[0]], 
                                      {
                                        strokeColor:'red', 
                                        strokeWidth:2,  
                                        fillColor:'#ff8800',
                                        fillOpacity:0.2
                                      }
                                      ); */
    
    fn = board.create('curve', [dataX, dataY],
                             {
                                strokeColor:'blue', 
                                strokeWidth:2,  
                                fillColor:'#ff8800',
                                fillOpacity:0.2
                              }   
                  );
    
    
   // gn = JXG.Math.Numerics.D(fn); //derived function
    //board.create('functiongraph', [fn],{dash:1})
    //board.create('curve', [dataX,  fn], {strokeColor:'#ff8800',strokeWidth:1,dash:1});
   // board.create('curve', [dataX,  gn], {strokeColor:'blue',strokeWidth:1,dash:1});
    
   
  },


  

  draw: function(f, x0, end, step){
      
            // User supplied function to be drawn.
        var   x = x0,
              turtle = board.create('turtle', 
                                    [x, f(x)],
                                    {
                                      fillColor:'#ff8800',
                                      fillOpacity:0.2
                                    }
                                  );
           turtle.moveTo([x, f(x)]);

          /*  var moveForward = function() {
                   x += step;
                   if (x>end) {
                      return;
                   }
                   turtle.moveTo([x, f(x)]);
                  // setTimeout(moveForward, timeout); // delay by 200 ms
               };
           */
           // turtle.hideTurtle();    // Hide the turtle arrow

          
          //  moveForward();          // Start the drawing
          //  turtle.penDown();         
  }

}