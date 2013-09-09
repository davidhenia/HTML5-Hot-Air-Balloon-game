
var game_grid = {
						width: 1024,
						height: 500,
						//height: window.innerHeight - 10,
							tile: {
								width: 16,
								height: 16
							}
					};
//Box2D
var gx=0;
	gy= 9.80665, //m/s2 == 3.21740 ft/s2
	ptm_ratio=32,
	doSleep=true,
	scale = 30,
	stepAmount = 1/60,


	balloon = null,
	randomWindCounter = 0,
	WorldWind = 0,
	AirTemperature = 0,
	BalloonLiftMass = 0,
	BalloonMassDiff = 0,
	deltaT = null;

var convert = {
				'lbft3_to_kgm3' : 0.0160184634,
				'ft3_to_m3'		: 0.0283168466,
		};	
	
//gauges
var	gauges = [],
	gaugeInfo = [],
	gr_x_counter = 0;

//convert for Box2D world ( to m/s2)
var balloonDetails = {
						'maxTemp' : 100,

						'tempChooser' : {
									0: 	0,
									1: 	5,
									2: 10,
									3: 15,
									4: 20,
								},

						//Air temperature (degrees celcius) : Lift/1000ft cubed (lb)
						//1 pound per (1000 (feet^3)) = 0.0160184634 kg / m3
						'tempLift' : {
									0: 	20 	* convert['lbft3_to_kgm3'],
									5: 	19.5 * convert['lbft3_to_kgm3'],
									10: 18 	* convert['lbft3_to_kgm3'],
									15: 17 	* convert['lbft3_to_kgm3'],
									20: 16 	* convert['lbft3_to_kgm3'],
								},
						'volume' : 180 * convert['ft3_to_m3'], // 180, 000 ft cubed 1 foot^3 =0.0283168466 metres^3
						'totalMass' : 2810 * convert['lbft3_to_kgm3'], // with burner, & people //1 pound per (1000 (feet^3)) = 0.0160184634 kg / m3
					};
					/*
						Volume of the balloon is 180,000ft cubed, therefore if the ambient temperature is
						5 => lift generated is 180*19.5 lb = 3510 lb. The total mass being lifted is 2810 lb & therefore,
						the difference is 710 lb.
					*/

CGame = {
	_scoreEnt : null,
	_score: 0,
	__testText: null,

	// Initialize and start our game
	start: function() { 

		this.loadPresets();
		this.defineScenes();
		 // Automatically play the loading scene
 	 	Crafty.scene("loading");

		Crafty.scene("main", function() {
			CGame.gameInit(); 
			CGame.randomWind();
			CGame.generateGraph(60);
	 	});
		
	},

	defineScenes: function(){
		 	
		  // The loading screen that will display while our assets load
		  Crafty.scene("loading", function() {
			    // Load takes an array of assets and a callback when complete
			    Crafty.load(["assets/images/preloader.gif"], function() {
			      Crafty.scene("main"); //when everything is loaded, run the main scene
			    });
			    
			    // Black background with some loading text
			   // Crafty.background("#000");
			   // Crafty.e("2D, DOM, text").attr({w: 100, h: 20, x: 150, y: 120});//.text("Loading").css({"text-align": "center"});
		  });
			  
		 
	},

	generateGraph: function(timeout){
		CalculusGraph.start(timeout);
	},

	loadPresets: function(){
		//initialse the canvas
		Crafty.init(game_grid.width, game_grid.height);
		Crafty.e("2D, canvas"); //.attr({x: 13, y: 37, w: 42, h: 42})

		Crafty.settings.modify('FPS', 60);

		//initialise box2d.
        Crafty.box2D.init(gx, gy, ptm_ratio, doSleep);
        var world = Crafty.box2D.world;
        
        //Box2D Debug Information
		//Crafty.box2D.showDebugInfo();

		
		//Game Entities
		this.createGameEntities();
		this.createBalloonComponents();
		
	},

	gameInit: function(){
		
		//Crafty.viewport.clampToEntities =true;

		CGame._testText = Crafty.e("2D, DOM, Text").attr({x: 150, y: 5, w: Crafty.viewport.width, h: 50}).text(" ");
		//var BalloonMass = 

		//balloonDensity = BalloonMass / balloonDetails['volume']

		//Balloon
		balloon = 
		Crafty.e("2D, Balloon")
				.attr({
							y:game_grid.height/2,
							x: 50,
							h: 151,
							w: 100
						})
				.BalloonControls()
				
				.box2d({  
							bodyType: 'dynamic',
							density : 0.75, //
							friction : 1,
							restitution : 0
						})
				.onContact("Ground", 
							function(){
								var txt=document.getElementById("game_info")
  									//txt.innerHTML="Landed ";

  									this._landed = true;
  									//§this.burn();
  								})
				.onContact("GameBlock", 
							function(data){
									var block = data[0].obj;
									//block.color("#00FF00");

							});
				//.burn();
		
		//console.log(balloon);
		//Ground
		CGame.generateMoreMap();
		
		//CGame._scoreEnt = Crafty.e("2D, DOM, Text").attr({x: 5, y: 5, w: Crafty.viewport.width, h: 50}).text("Score: 0");
		//CGame.generateRandomFruit();
		//Walls
		//Crafty.e("2D, Wall").attr({ x: 0, y: 0, w: game_grid.width, h: 2 }).box2d({  bodyType: 'static'});
		//Crafty.e("2D, Wall").attr({ x: 0, y: 0, w: 2, h: game_grid.height - 70 }).box2d({  bodyType: 'static'});
		//Crafty.e("2D, Wall").attr({ x: game_grid.width-2, y: 0, w: 2, h: game_grid.height - 70 }).box2d({  bodyType: 'static'});

	},




	

	randomWind: function() {
        timeSequence = 30;

        //a random number between 0 and 5:
        if(randomWindCounter !== 0 && gx == 0) {
			gx = Math.floor((Math.random()*5)); 
			gx = (randomWindCounter%2 == 0) ? gx*1 : gx*-1;
		} else {
         gx = 0;
     	}
		
		var i = (randomWindCounter !== 0 && gx == 0) ? gx : 0;                     //  set your counter to 1

		function myLoop () {           //  create a loop function
		   setTimeout(function () {    //  call a 3s setTimeout when the loop is called
		      WorldWind = i;         //  your code here
		      if (randomWindCounter%2 == 0) {//is even
			      i++;                     //  increment the counter
			      if (i < gx) {            //  if the counter < 10, call the loop function
		         	myLoop();             //  ..  again which will trigger another 
			     }
		      
		      } else {
		      
		      	  	i--;                     //  increment the counter
			      	if (i > gx) {            //  if the counter < 10, call the loop function
			         	myLoop();             //  ..  again which w
			      	}
			
				}
		   }, 300)
		}

		myLoop();                      //  start the loop

       // var rand = Math.round(Math.random() * (3000 - 500)) + 500000; // generate new time (between 3sec and 500"s)
       

        //console.log();
        randomWindCounter = (randomWindCounter == 0) ? 1 : randomWindCounter+randomWindCounter;

        //Crafty.box2D.world.m_gravity.x = gx;

        setTimeout(CGame.randomWind, 3000); //every 1min
    },

	/*
	*/

	/*
	*/
	generateMoreMap: function(){
		var	groundi_w = 128;	
		//if((gr_x_counter/groundi_w) < 28)
		if(1 === 1)
		{	
			for(var groundi = 0; groundi <= Math.floor(game_grid.width/groundi_w) * Math.floor(game_grid.width/groundi_w);  groundi++)
			{
				//console.log(gr_x_counter);
				if(groundi !== 0 && groundi%3 == 0)
				{
					Crafty.e("2D, Ground2").attr({
												x: gr_x_counter,
												y: game_grid.height - 82, 
												w: groundi_w, 
												h: 134
											})
										.box2d({  _bodyType: 'static'});
				} else
					Crafty.e("2D, Ground").attr({
												x: gr_x_counter,
												y: game_grid.height - 70, 
												w: groundi_w, 
												h: 122
											})
										.box2d({  _bodyType: 'static'});



				if(groundi !== 0 && groundi%4 == 0)
				{
					Crafty.e("2D, GameBlock").attr({ 
												x: gr_x_counter, 
												y: game_grid.height - (122+80),
											 	w: groundi_w - 20, 
											 	h: 134

										}).box2d({  bodyType: 'static'});
				}

				gr_x_counter += groundi_w;
			}
		}
	},

	generateFuelCoins: function(){
		for(var i =0; i< 10; i++)
		{
		 	Crafty.e('FuelCoins')
								.attr({ 
										x: i, 
										y: i * i 
									})
								.box2d({  _bodyType: 'static'})
								.text('Fuel');
		}
	},

	generateRandomFruit: function(){
		Crafty.e("2D, fruit").box2d({  
							bodyType: 'dynamic',
							density : 0.1, //
							friction : 1,
							restitution : 1
						});

	},

	createGameEntities: function() { //define Game Entities
		Crafty.sprite(1, 'assets/images/texture1.png', 
					{
						groundSprite_Ground: [132, 262, 128, 122],
						groundSprite_Ground2: [2, 2, 128, 134],
						dirtSprite_Ground: [2, 2, 128, 134]
					});
		

		Crafty.sprite(1, 'assets/images/hot_air_balloon.png', {
					balloonSprite: [134, 0, 346, 460],//"spriteSourceSize": {"x":134,"y":0,"w":346,"h":460},
				}); //100, 151
				
		

		//Balloon object
		Crafty.c('Balloon', 
					{
						original: { x: this._x, y: this._y,},
						init: function() {
								this.requires('2D, Canvas, balloonSprite, BalloonControls, Box2D');

								this.bind('EnterFrame', this.pan);
						},



						pan: function(){
							
			    		var  	offsetx  = 200,
			    				offsety  = game_grid.height - 200;
						 	
						 //	CGame.generateMoreMap();
						 //Crafty.viewport.follow(this, offsetx, offsety);
						 	//Crafty.viewport.mouselook(true);

						 	if(this._y - 50  < 20) 
						 		Crafty.viewport.pan('y', -1 * Crafty.viewport.height + this._y  - 50, 30);
						 	else if(this._y > Crafty.viewport.height + this._y) 
						 		this.destroy();
						 	//	Crafty.viewport.scroll('_y', Crafty.viewport.height+40);
						 	//else
						 	//	Crafty.viewport.scroll('_y', 500);
						 	//else if(this._y > 10)
							
							if(this._x + 100 > Crafty.viewport.width) 
								Crafty.viewport.pan('x', Crafty.viewport.width / 2, 30);
							else if(this._x - 50 < Crafty.viewport.width) 
								Crafty.viewport.pan('x', -1 * Crafty.viewport.width / 2, 30);
						 	//	Crafty.viewport.scroll('_y', Crafty.viewport.width+50);

						 	CGame._testText.text(this._x + ' -> '+ Crafty.viewport.width);

						}
					});
		
		
		//Ground object
		Crafty.c('Ground', { init: function() { this.requires('2D, Canvas, Box2D, groundSprite_Ground'); }, });
		Crafty.c('Ground2', { init: function() { this.requires('2D, Canvas, Box2D, groundSprite_Ground2'); }, });

		Crafty.c('Wall', 
					{
						init: function() {
										this.requires('2D, Canvas, Box2D, Color'); //
										this.color('rgb(20, 75, 40)'); 
										
								},
						
					});

		Crafty.c("Colorme", {
					colors : null,
					init: function() {
					  this.requires("Color");
					  this.colors = ["#0000FF" ,"#FF0000"];
					},
					colorme: function(index) {	
					  this.color(this.colors[index]);
					  return this;
					},

					
				  });

		Crafty.c("GameBlock", {
								init: function() {
								
									this.requires('2D, Canvas, Box2D, dirtSprite_Ground');
									//this.color('#ff8800'); 
									//this.color('rgb(20, 75, 40)');
								},
					isBlock : true,
					id : '',
					remain : 0,
					gameBlock: function(_id, _remain) {	
					  this.id = _id;
					  this.remain = _remain;
					  return this;
					}
				 });

		

		Crafty.sprite(64, "assets/images/fruit.png", {
							banana: [0,0],
							apple: [1,0],
							watermelon: [2,0],
							orange: [3,0],
							coconut: [4,0],
							lemon: [5,0]
						});

		Crafty.c("fruit", {
				_choice: ["banana", "apple", "watermelon", "orange", "coconut", "lemon"],
				_xspeed: 0,
				_yspeed: 0,
				_massAmount: Math.floor((Math.random()*15)),
				
				init: function() {

					this.requires('2D, Canvas, Box2D, Text, Color');

					var index = Crafty.math.randomInt(0, 5),
						fruit = this._choice[index],
						rotation = Crafty.math.randomInt(8, 12),
						direction = Crafty.math.randomInt(0, 1);
						
					this.addComponent(fruit).origin("center");
					this.y = Crafty.viewport.height;
					this._yspeed = Crafty.math.randomInt(15, 18);
					this.z = 1;
					
					if(direction) {
						this.x = 0;
						this._xspeed = Crafty.math.randomInt(3, 5);
					} else {
						this.x = Crafty.viewport.width;
						this._xspeed = -1 * Crafty.math.randomInt(3, 5);
					}
					
					this.bind("enterframe", this.generate);
					
					
				},

				generate: function(){
					
						this.rotation += rotation;
						this.y -= this._yspeed;
						this.x += this._xspeed;
						
						if(this._y > Crafty.viewport.height) {
							this.destroy();
							if(!this.hit) {
								CGame._score -= (index+1) * 10;
								CGame._scoreEnt.text("Score: "+score);
							}
						}
					
				},

				collect: function(){
						this.sprite(index, 1);
						this.hit = true;
						score += (index+1) * 10;
						scoreEnt.text("Score: "+score);
						
						Crafty.e("2D, Canvas, "+fruit).attr({z:0, x: this._x, y: this._y, alpha: 0.2}).sprite(index, 2);
				}
			});
	},

	

	//other game controls
	createBalloonComponents: function() { // Define Game Entities Components
		var dt = 0,
			gravity = gy,
		 	dx = 0.0, //let wind forces act on the balloon only	
		 	dy = 0.0, //let wind forces act on the balloon only	
		 	dx_velocity = 0,
		 	dy_velocity_max = 0,
		 	last_dy = 0,
		 	last_dy_velocity_max = 0,
		 	c_off= 0,
		 	c_on = 0,
		 	original_dy = 0,
		 	gravity_vel = 0,
		 	balloon_weight = 0,

		 	gravity_vel_on = 0,
		 	gravity_vel_off = 0,
		 	
		 	position,
		 	box2dBodyMass,
		 	ratioConvertedMass,
		 	speed,
		 	velocity = null;
		 
		var 	start = new Date()  / 1000, 
		 		last_on = new Date() / 1000, 
		 		last_off = new Date() / 1000, 
		 		elapsedSeconds_on = 0, 
		 		elapsedSeconds_off = 0, 
		 		totalSeconds_on = 0,
		 		totalSeconds_off = 0,
		 		now_on = null, 
		 		now_off = null;

		var 	//start = new Date()  / 1000, 
		 		last_left_on = new Date() / 1000, 
		 		last_right_on = new Date() / 1000, 
		 		
		 		last_left_off = new Date() / 1000, 
		 		last_right_off = new Date() / 1000, 
		 		
		 		elapsedSeconds_left_on = 0, 
		 		elapsedSeconds_left_off = 0, 
		 		
		 		elapsedSeconds_right_on = 0, 
		 		elapsedSeconds_right_off = 0, 
/*
		 		totalSeconds_on = 0,
		 		totalSeconds_off = 0,
*/
		 		now_left_on = null, 
		 		now_left_off = null, 
		 		
		 		now_right_on = null, 
		 		now_right_off = null;
		 		

		
		var now_graph_gen = new Date()  / 1000, 
			last_graph_gen = new Date()  / 1000, 
			elapsedSeconds_graph_gen = 0; 

		Crafty.c('BalloonPhysics', {

			    _velocity: new Crafty.math.Vector2D(0, 0),

			    init:function(){
			        this.requires('2D, Box2D');
			        
			        //this.bind('EnterFrame', );
			       // this.bind('EnterFrame', this.step);

			        AirTemperature =  balloonDetails['tempChooser'][Math.floor((Math.random()*4))],
					BalloonLiftMass =  balloonDetails['volume'] * (balloonDetails['tempLift'][AirTemperature]), //converted to Kn/m^3
					//therefore
					BalloonMassDiff =  BalloonLiftMass - balloonDetails['totalMass']; 
			    },

			    



			    step: function(){
			      },

			});
	

		Crafty.c("BalloonControls", {
			 __move: {left: false, right: false, up: false, down: false},    
			 _change: {x: 0, y: 0},    
			  _speed: 3,

			init: function() {
				this.speed = 74;
			  	this.requires("Keyboard, BalloonPhysics");
			  	
			  	//if(this._landed = true)
			  	//	this.pan();



			  	//this.bind('EnterFrame', );	
			  	
			  	//this.landing_counter = this.landing_counter + 1; 
			  },

			setPhysicsVars: function(){
				var maxTemp = 100;
					ambientTemp = AirTemperature;
					
					position 		= this.body.GetPosition(),
					box2dBodyMass 	= this.body.GetMass(),
				
					//use the relative mass (in game world)
					ratioConvertedMass		= balloonDetails['totalMass']/box2dBodyMass,
					//angle 			= this.body.GetAngle() * (180/Math.PI), //in radians so multiply by (180/math.pi) to convert in degrees
					//volume = //mass/density
					velocity 	= this.body.GetLinearVelocity(),
					speed 		= Math.round( velocity.Length() ) / 100,
					dy = gravity*ratioConvertedMass, //F = mg
				
				 	original_dy = gravity*ratioConvertedMass; //F = mg
						
			},
			

			BalloonControls: function(speed) {
				//this.bind("EnterFrame", this.ControlBalloon);  
				
				this.CustomControls();

				//console.log(_change.y);
				return this;
			},

			CustomControls:  function(speed) {
			      if (speed) this._speed = speed;
			      var move = this.__move;
			     // var change = this._change;

				
				var new_now = new Date()  / 1000;

				this.bind('EnterFrame', function() {
				 	this.setPhysicsVars();
				 	
				 	var maxSpeed = 10;							
					var velocity = this.body.GetLinearVelocity();
					//console.log(velocity);
					var speed = velocity.Length();							
					if (speed > maxSpeed) {
						this.body.SetLinearDamping(0.5, 0.5);
					} else if (speed < maxSpeed) {
						this.body.SetLinearDamping(0);
					}

			        // Move the player in a direction depending on the booleans
			        if (move.right) dx +=  0.5 * this.speed; 
			        if (move.left) dx -=  0.5 * this.speed; 
			        
			        if (move.up) {
			        	//alert('up');
			        	gravity_vel_off = 0;
			        	elapsedSeconds_off = 0;
			        	now_on =  new_now;
			        	elapsedSeconds_on = now_on - last_on;
					   
					    gravity_vel_on = gravity * elapsedSeconds_on;

					    balloon_weight = (BalloonMassDiff/box2dBodyMass) + (gravity_vel_on);
						dy_velocity_max = balloon_weight;
				  		
				  		last_on = now_on;
				  		//last_off =  new_now;
			        } else {
			        	var max_vel = dy_velocity_max;
			        	gravity_vel_on = 0;
			        	elapsedSeconds_on = 0;
			        	//c_off = last_dy_velocity_max  gravity;
			  			dy += (-1 *gravity) * ratioConvertedMass; //* elapsedSeconds_off; 


			  			now_off =  new_now;
		        		elapsedSeconds_off = now_off - last_off;

		        		gravity_vel_off = gravity * elapsedSeconds_off; 

				  		var current_velocity = gravity_vel_off + ratioConvertedMass;

				  		

				  		dy_velocity_max =  current_velocity - max_vel;

				  		last_off = now_off;

			        }
			        if (move.down) {
			        	gravity_vel_on = 0;
			        	elapsedSeconds_on = 0;
			        	dy = original_dy;
			        }

			        dx = (dx !== 0) ? (dx + (WorldWind/10) )/Crafty.box2D.PTM_RATIO : 0;
			      	//dy = (dy < 0) ? dy/Crafty.box2D.PTM_RATIO : 0;

			      	dy = (dy_velocity_max < 1) ? dy_velocity_max : 0; 



			      	elapsedSeconds_graph_gen = now_graph_gen - last_graph_gen;
					CalculusGraph.updateData(balloon_weight, elapsedSeconds_graph_gen, gravity);
					this.dumpText();
					//this._change.x = dx;
					//this._change.y = dy;

					if(move.right || move.left || move.up || move.down || dx !== 0 || dy !== 0)
					{
						var force = new b2Vec2(dx, dy, true);
						return this.body.ApplyImpulse(force, this.body.GetWorldCenter());
					}
					//return this;
			      
			      }).bind('KeyDown', function(e) {
			        // Default movement booleans to false
			      //  move.right = move.left = move.down = move.up = false;

			        // If keys are down, set the direction
			        if (e.keyCode === 39) { $('#right-key').addClass('holding'); move.right = true; }//39 - right
			        if (e.keyCode === 37) {  $('#left-key').addClass('holding'); move.left = true; 	} //37 - left
			        if (e.keyCode === 38) {  $('#up-key').addClass('holding'); move.up = true; 		}//38 - up
			        if (e.keyCode === 40) {  $('#down-key').addClass('holding'); move.down = true; 	}//40 - down

			        //this.preventTypeaheadFind(e);
			      }).bind('KeyUp', function(e) {
			        // If key is released, stop moving
			        if (e.keyCode === 39) { $('#right-key').removeClass('holding'); move.right = false; }
			        if (e.keyCode === 37) { $('#left-key').removeClass('holding'); move.left = false; 	}
			        if (e.keyCode === 38) { $('#up-key').removeClass('holding'); move.up = false; 		}
			        if (e.keyCode === 40) { $('#down-key').removeClass('holding'); move.down = false;	}

			        //this.preventTypeaheadFind(e);
			      });


		      	//var force = new b2Vec2(dx, dy);
					//return this.body.ApplyForce(force, this.body.GetWorldCenter(), 1/60);
					//return this.body.ApplyImpulse(force, this.body.GetWorldCenter());
					

				return this;
			},



            dumpText: function(){
            	var windDirection = '';

            	if (WorldWind > 0) 
            		 windDirection = '&rarr;';
				else if (WorldWind < 0) 
					 windDirection = '&larr;'; 

            	
            	$('#air-temp').html(AirTemperature);
            	$('#wind').html((WorldWind/10) +' '+windDirection);
            	$('#balloon_weight').html('Speed: '+speed*30);

            	/*
				var txt=document.getElementById("game_info_position");
						txt.innerHTML = "";
						txt.innerHTML = " "
										+"dx: "+ dx
										+"<br/> dy: "+ dy
										+"<br/> dy_velocity_max: "+ dy_velocity_max
										+"<br/> Wind: "+ WorldWind
										+"<br/> x: " + Math.round( position.x * Crafty.box2D.PTM_RATIO ) /100 
										+ "<br/> y: " + Math.round( position.y * Crafty.box2D.PTM_RATIO  ) /100
										+"<br/> now_on: "+ now_on  
										+"<br/> now_off: "+ now_off 
										+"<br/> last_on: "+ last_on  
										+"<br/> last_off: "+ last_off  
										+"<br/> elapsedSeconds_on: "+ Math.floor( elapsedSeconds_on)
										+"<br/> elapsedSeconds_off: "+ Math.floor( elapsedSeconds_off)
										+"<br/> speed: "+ speed 
										//+"<br/> ratioMass: "+ ratioMass 
										+"<br/> box2dBodyMass: "+ box2dBodyMass 
										
										
										
										+"<br/> AirTemperature: "+ AirTemperature
										+"<br/> BalloonLiftMass: "+ Math.round( BalloonLiftMass/box2dBodyMass ) /100
										+"<br/> BalloonMassDiff: "+ Math.round( BalloonMassDiff/box2dBodyMass ) /100
										//+"<br/> V': "+ dV
										//+"<br/> Wind: "+ Crafty.box2D.world.m_gravity.x 
										+"<br/> Generated Ground Levels: "+ gr_x_counter/128 
										+" <br/>";

				*/
            }

                

	  });



		

	},

	loadCreatedEntities: function(){ //Load the Game entities
		

	},


	generateFire: function(){

		
	},

	
	

	end: function(){}

	


	
};

//gGame = new Game();


	








