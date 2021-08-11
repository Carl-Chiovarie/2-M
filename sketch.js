/*
Project started Aug-2-2021

hexagon adaptive rainbow grid thing
*/

function mRandom (min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
  //The maximum is inclusive and the minimum is inclusive
}

function shuffle(array) { // i take full credit for this
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function checkEqual (array1, array2){
  for (let i = 0; i < array1.length; i++){
    if (array1[i] != array2[i]){
      return false;
    } else{
      return true;
    }
  }
}

function genVariPrefs(){
  // let CVAdjust = [0.01 * mRandom(0, 15), 0.01 * mRandom(20, 70)]; // adjusts by percentage
  let CVAdjust = [0.01 * mRandom(0, 40), 0.01 * mRandom(0, 30)]; // adjusts by percentage
  let tempColorVariance = [
    Math.floor(colorVariance * CVAdjust[0]),
    Math.ceil(colorVariance * CVAdjust[1])
  ];
  let saturation = [mRandom(5, 20), mRandom(5, 20)];
  // let brightness = [mRandom(2, 5), mRandom(4, 10)];
  
  let variPrefs = [
    -tempColorVariance[0], tempColorVariance[1],
    -saturation[0], saturation[1],
    -1, 1 // adjusting all three lead to a lot of noise
    // -brightness[0], brightness[1]
  ];

  // let CVAdjust = (0.01 * mRandom(20, 70)) * (Math.round(Math.random()) * 2 - 1); // adjusts by percentage
  // let tempColorVariance = (colorVariance * CVAdjust) * (Math.round(Math.random()) * 2 - 1);
  // let saturation = mRandom(5, 20) * (Math.round(Math.random()) * 2 - 1);
  // // let brightness = [mRandom(2, 5), mRandom(4, 10)];
  // let variPrefs = [
  //   tempColorVariance,
  //   saturation,
  //   0
  // ];



  // HSBPrefs = [ for reference
  //   0,360, //  HUE  don't change this
  //   10,80, //  Saturation
  //   70,95  //  Brightness
  // ]

  // let baseColor = [ also for reference
  //   mRandom(HSBPrefs[0], HSBPrefs[1] - HSBPrefs[2]),
  //   mRandom(HSBPrefs[3], HSBPrefs[4]),
  //   mRandom(HSBPrefs[5], )
  // ];


  // this should be returning three values. Theres too many levels of random in this
  return variPrefs;
}

function genColor (colorBase, variPrefs, largeColorChange){
  colorMode(HSB); // I know HSV makes more sense but p5 uses HSB
  let HSBPrefs = [
    // newest settings
    0, 360, //  HUE  don't change this
    55, 80, //  Saturation
    80, 95 //  Brightness
    
    // // pastels
    // 0,360, //  HUE  don't change this
    // 0,20, //  Saturation
    // 95,95  //  Brightness

    // // black and gray
    // 0, 360, //  HUE  this has probably broken something TODO fix maybe?
    // 0, 0, //  Saturation
    // 1, 40, //  Brightness


    // // black and gray stagnate backgrounds
    // 40, 42, //  HUE  this breaks vari color generation
    // 0, 0, //  Saturation
    // 1, 40, //  Brightness
    // This would be amazing for a video background. Every time the video 
    // switch's topics or whatever it can shift to another background, 
    // emphasizing the transition
  ];

  /* Have a way to implement color palettes
  option to display palette colors in order or randomly scattered
  if they are randomly scattered their frequency should be tied to their saturation
  or a per color custom weight(?) frequency */

  function checkOverFlow(val, type){
    //checks if HSB val is out of bounds and corrects it
    // if (val > 100 && type != 'H'){
    //   console.log('theres an invalid checkOverFlow() input somewhere')
    //   console.log("val", val)
    //   console.log("type", type)
    // }

    let valLimit;
    let min;
    let max;
    if (type == "H"){
      valLimit = 360; // limit, as in the limit of this value type
      min = HSBPrefs[0];
      max = HSBPrefs[1];
    } else if (type == "S"){
      valLimit = 100;
      min = HSBPrefs[2];
      max = HSBPrefs[3];
    } else if (type == "B"){
      valLimit = 100;
      min = HSBPrefs[4];
      max = HSBPrefs[5];
    }

    if (val > max){
      // console.log("Max val hit", val, type);
      if (type == "H"){
        return val - valLimit; // Hue loops
      } else{
        return max;
      } // Saturation and brightness ar limited to max
    } else if (val < min){
      // console.log("Min val hit", val, type);
      if (type == "H"){
        return valLimit + val;
      } else{
        return min;
      }
    } else{
      return val; // color passed all checks no changes needed
    }
  } // end of checkOverFlow

  if (largeColorChange){
    // generates new complementary base color
    let CBAdj = 180 + mRandom(variPrefs[0] * 0.35, variPrefs[1] * 0.35);

    // let colorBaseOpp = (
    //   colorBase[0]
    //   + (180 + mRandom(variPrefs[0] * 0.35, variPrefs[1] * 0.35))
    // )
    console.log("Comp color change", CBAdj);
    let baseColor = [
      // checkOverFlow(colorBase[0] + (180), "H"),
      // checkOverFlow(colorBaseOpp, "H"),
      checkOverFlow(colorBase[0] + CBAdj, "H"),
      mRandom(HSBPrefs[2], HSBPrefs[3]),
      mRandom(HSBPrefs[4], HSBPrefs[5])
    ];
    return baseColor;
  } else if (variPrefs == undefined){
    // generates new base color
    let baseColor = [
      mRandom(HSBPrefs[0], HSBPrefs[1]),
      mRandom(HSBPrefs[2], HSBPrefs[3]),
      mRandom(HSBPrefs[4], HSBPrefs[5])
    ];
    return baseColor;
  } else{ // generates new vari color
    // adjust variantColorBase to create a slightly different color
    let HSB = ["H", "S", "B"];
    let variColor = [];

    // for (let i = 0; i < 3; i++){
    //   // creates new color by randomizing all three vals
    //   variColor.push(
    //     checkOverFlow(
    //       // check overflow also solves overflows
    //       colorBase[i] + variPrefs[i],
    //       HSB[i]
    //     )
    //   );
    // }

    let j = 0;
    for (let i = 0; i < 3; i++){
      // creates new color by randomizing all three vals
      variColor.push(
        checkOverFlow(
          // check overflow also solves overflows
          colorBase[i] + mRandom(variPrefs[j], variPrefs[j + 1]),
          HSB[i]
        )
      );
      j += 2;
    }
    return variColor;
  }
} // end of genColor

let hexRepeat = 1;
let colorVariance = 100
class pixelBlock{
  constructor(position, baseColor, variPrefs, sideLen, hexWidth, ID, dupeID){
    this.ID = ID;
    this.position = position;
    this.baseColor = baseColor;
    this.currentColor = [...this.baseColor];
    this.currentColorGoal = [...this.baseColor];
    // this.outLine = [
    //   this.baseColor[0],
    //   this.baseColor[1],
    //   this.baseColor[2] + 5
    // ]; // might as well be one global var
    
    this.goalType = "vari"; // approaching variation or base color
    this.variPrefs = variPrefs;

    this.frameCCGArrivedAndSince = [0, 0];

    this.setGoal = function (inputColor){
      this.currentColorGoal = inputColor;
      this.frameCCGArrivedAndSince = [frameCount, 0];
    };

    // May not be necessary if we just set colorBase to a global var
    this.setBase = function (inputBase){
      this.baseColor = inputBase;
      // this.outLine = [
      //   this.baseColor[0],
      //   this.baseColor[1],
      //   this.baseColor[2] + 5
      // ];
      this.goalType = "base";
      this.setGoal(this.baseColor);
      
    };

    this.setVariPrefs = function (inputPrefs){
      this.variPrefs = inputPrefs;
    };

    this.genVari = function (){
      this.goalType = "vari";
      this.setGoal( genColor(this.baseColor, this.variPrefs) );
    };

    this.update = function (){  
      // this.frameCCGArrivedAndSince[1] += 1;

      if (this.goalType == "vari"){
      this.frameCCGArrivedAndSince[1] += 1;        
      }

      // check if currentColor has reached currentColorGoal
      if (checkEqual(this.currentColor, this.currentColorGoal)){
        // generates new vari color and sets it as current ColorGoal
        if (this.goalType == "base"){
          // if (mRandom(0,FPS/4) == 1){
            this.goalType = "vari";
            this.genVari();
          // }
          // sets color goal to base. Does not generate new base
        } else if (this.goalType == "vari"){
          this.goalType = "base";
          this.setGoal(this.baseColor);
          // catches input error. Sets color goal to base
        } else{
          console.log("###########################");
          console.log(
            "Error pixelBlock",
            this.position,
            "invalid this.goalType"
          );
          console.log("###########################");
          this.goalType = "base";
          this.setGoal(this.baseColor);
        }
      } else{
        if (Math.abs(this.currentColorGoal[0] - this.currentColor[0] > 180)){
          this.currentColor[0] -= mRandom(0,2);
        } else if (Math.abs(this.currentColor[0] - this.currentColorGoal[0] > 180)){
          this.currentColor[0] += mRandom(0,2);
        } else if(this.currentColor[0] < this.currentColorGoal[0]){
          this.currentColor[0] += mRandom(0,2)
        } else if (this.currentColor[0] > this.currentColorGoal[0]){
          this.currentColor[0] -= mRandom(0,2)
        } 

        if (this.currentColor[0] <= 0){ 
          this.currentColor[0] = 360;
        } else if (this.currentColor[0] >= 360){
          this.currentColor[0] = 0;
        }

        for (let i = 1; i < 3; i++){
          if (this.currentColor[i] < this.currentColorGoal[i]){
            this.currentColor[i] += mRandom(0, 1) * 0.5;
          } else if (this.currentColor[i] > this.currentColorGoal[i]){
            this.currentColor[i] -= mRandom(0, 1) * 0.5;
          } // if neither then they're even
        }
      }
    };

    this.scaleMin = mRandom(90, 94);
    let halfSideLen = sideLen / 2 // optimization at its best
    this.show = function (){
      let j = 0
      noStroke();
      // stroke(this.baseColor);
      // stroke(this.outLine);
      fill(this.currentColor);

      let scaler = 0.95 - this.frameCCGArrivedAndSince[1]/330;
      // let scaler = 0.95 - this.frameCCGArrivedAndSince[1]/50;

      // if (scaler < 0.83){
      //   scaler = mRandom(83, 84) * 0.01;
      // }
      if (scaler < this.scaleMin * 0.01){
        scaler = mRandom(this.scaleMin, this.scaleMin + 1) * 0.01;
      }

      push(); // saves current canvas configs
        // NOTE this draws a hex at the center of a given position
        translate(this.position[j], this.position[j + 1]);
        scale(scaler) // the outline is actually the gap between hexagons
        // scale(0.95) // the outline is actually the gap between hexagons
        scale(1) // the outline is actually the gap between hexagons
        rotate(90);
        beginShape();
          vertex(-halfSideLen, -hexWidth);
          vertex(halfSideLen, -hexWidth);
          vertex(sideLen, 0);
          vertex(halfSideLen, hexWidth);
          vertex(-halfSideLen, hexWidth);
          vertex(-sideLen, 0);
        endShape(CLOSE);
      pop(); // resets all changes to past canvas configs
      j += 2;

    }; // end of show function
  } // end of constructor
} // end of class

let pixelBlockCount = 0;
let pixelBlocksArray = [];

// TO DO optimize so that we only generate half of the pBs
// Shuffle reshuffle the pBs to fill the other half of the array
// assign each object its new second position. I still only solves for one
// hexagon, now it draws it twice
function genAllPixelBlocks(){
  // if the scale = 16 there will be 16 equally sized hexagons. Their size is
  // solved from taking windowHeight and dividing it by the scale var
  // I could just rename this to be hexagons on y/x axis

  // I'm using windowHeight since its easier to solve for side length with the
  // hexagon orientation I'm using ⬡ ⬢

  // should all hexagons be drawn within the window or should they clip and
  // continue partly off screen? future carl: cLipping is easier go with that
  let solidCount;
  if (
    confirm("Would you like to use custom inputs? Press cancel or ESC for default")
  ){
    solidCount = prompt(
      "Hexagon X axis count. Default 35 for PC 20 for mobile"
    );
    strokeWeight(
      prompt("Outline thickness. Default 2 for PC, 0.5 - 1 for mobile")
    );
    colorVariance = prompt(
      "Input Color variance. Recommended ~100"
    );
  } else{
    if (windowWidth > windowHeight){
      solidCount = 35;
      strokeWeight(2);
    } else{
      solidCount = 20;
      strokeWeight(1);
    }
  }

/*
  problem there are two x axis counts
  also making a perfect consistent hexagon grid is hard as
  example:
   }{}{}{}{ 6
  1{}{}{}{} 5
    }{}{}{}{ 6

    {}{}{}{} 5
  2 }{}{}{}{ 6
    {}{}{}{} 5
  because of how hexagons interlock we will always have clipped hexagons.
  they can even be clipped horizontally which is also fun
  even more fun both x layers can be clipped simultaneously
    {}{}{}{ 4
  3 }{}{}{} 4
    {}{}{}{ 4

    we can avoid these by only allowing the user to input a number of hexagons
    on the first layer. So we can always get the second example
*/


  clipCount = solidCount + 1;
  // note hexagons will be drawn from their center. the starting layer will always clip
  let hexWidth = windowWidth / solidCount / 2;
  // let hexWidth = windowWidth / solidCount / 2;
  let hexSide = hexWidth / Math.acos(30 * (PI / 180));

  // three stacked hex sides is equal to two layers
  // let layerCount = Math.ceil((((windowHeight - hexSide) / hexSide) / 3) * 2) + 1
  let layerCount = Math.ceil((windowHeight / hexSide / 3) * 2) + 1;
  console.log("layerCount", layerCount);
  let objectLayerCount = Math.ceil(layerCount / hexRepeat)

  let tempBase = genColor();
  let tempVariPref = genVariPrefs();

  for (let layer = 0; layer < objectLayerCount; layer++){
    pixelBlocksArray.push([]);

    if (layer % 2 != 0){
      for (let layerPos = 0; layerPos < clipCount; layerPos++){
        pixelBlocksArray[layer].push(
          new pixelBlock(
            [
              layerPos * (hexWidth * 2),
              // I'm subtracting sideLen to fix the offset from clipping the first layer
              layer * hexSide * 1.5,
            ],
            tempBase,
            tempVariPref,
            hexSide,
            hexWidth,
            [layerPos, layer]
          )
        );
        pixelBlockCount++;
      }
    } else {
      for (let layerPos = 0; layerPos < solidCount; layerPos++){
        pixelBlocksArray[layer].push(
          new pixelBlock(
            [
              // layerPos * (hexWidth * 2),
              layerPos * (hexWidth * 2) + hexWidth,
              layer * (hexSide * 1.5),
            ],
            tempBase,
            tempVariPref,
            hexSide,
            hexWidth,
            [layerPos, layer]
          )
        );
        pixelBlockCount++;
      }
    }
  }
  console.log("pixelBlockCount", pixelBlockCount);

  if (hexRepeat > 1){
    console.log("hexRepeat", hexRepeat);
    pixelBlockCount *= 2;

    // TO DO fix shuffle so that it accounts for unique layer types
    let shuffledPBArray = shuffle(pixelBlocksArray);
    console.log("shuffledPBArray", shuffledPBArray);

    for (let layer = pixelBlocksArray.length; layer < layerCount; layer++){
      // console.log(layer)
      if (layer % 2 != 0){
        pixelBlocksArray.push(shuffledPBArray[pixelBlocksArray.length - layer]);
      } else{
        pixelBlocksArray.push(shuffledPBArray[pixelBlocksArray.length - layer]);
      }
      for (let layerPos = 0; layerPos < layer.length; layerPos++){
        pixelBlocksArray[layer][layerPos].dupeID = [layer, layerPos];
        pixelBlocksArray[layer][layerPos].position[2] = layerPos * (hexWidth * 2);
        pixelBlocksArray[layer][layerPos].position[3] = layer * hexSide * 1.5;
      }
    }
    console.log("pixelBlockCount after hexRepeat", pixelBlocksArray)
  }
} // end of genAllPixelBlocks

// let FPS = 60;
let FPS = 24;
let frameCountStart = 0;
let baseTimeMinMax = [10, 20]; // in seconds
let baseSetTime;

let timerToggle = true;

function checkBaseTimer(overRide, compColor){
  // calcs frames since start or last reset
  let framesSince = frameCount - frameCountStart;

  if (timerToggle == true){
    // if the baseSetTime is reached a new base color is generated and set to the PBs
    if (framesSince > (baseSetTime * FPS) || overRide != undefined){
      let newVariPrefs = genVariPrefs();
      let newBase = genColor();
      if (mRandom(0, 8) == 1 || compColor){ // complementary color rarity
        newBase = genColor(
          pixelBlocksArray[0][0].baseColor,
          newVariPrefs,
          true
        );
      }
      // background(newBase);
      for (let xAxis = 0; xAxis < pixelBlocksArray.length; xAxis++){
        for (let yAxis = 0; yAxis < pixelBlocksArray[xAxis].length; yAxis++){
          pixelBlocksArray[xAxis][yAxis].setBase(newBase);
          pixelBlocksArray[xAxis][yAxis].setVariPrefs(newVariPrefs);
        }
      } // end of loops

      // resets base timer
      baseSetTime = mRandom(baseTimeMinMax[0], baseTimeMinMax[1]);
      console.log("New baseSetTime", baseSetTime);
      // console.log("new baseSetTime", baseSetTime)
      frameCountStart = frameCount;
    }
  }
}

function touchStarted(){
  // checking frame count prevents detecting a touch event twice
  if (timerToggle && frameCount - frameCountStart > FPS / 8){
    checkBaseTimer("overRide");
  } else if (!timerToggle){
    console.log("Scene generation is paused, press space to unpause");
  } else{
    console.log("You're tapping too fast!");
  }
}

function keyPressed(){
  if (keyCode == ENTER){
    colorMode(HSB);
    userBaseColor = prompt("Please enter a HEX color. example: #ff8c69");
    userBaseColor = color(userBaseColor).levels; // translates to HSB

    if (userBaseColor != undefined){
      checkBaseTimer("overRide");
      for (let layer of pixelBlocksArray){
        for (let layerPos of layer){
          layerPos.setBase(userBaseColor);
        }
      } // end loop de loops
    }
  }

  if (keyCode == 17){ // CTRL
    if (timerToggle == true){
      checkBaseTimer("overRide", true); // triggers comp
    } else{
      console.log("Scene generation is paused, press space to unpause");
    }
  }

  if (keyCode == 32){ // spaceBar
    frameCountStart = frameCount;
    timerToggle = !timerToggle; // flips toggle to pause
    if (!timerToggle){
      console.log("");
      console.log("timerToggle", timerToggle);
      console.log("baseColor", pixelBlocksArray[0][0].baseColor);
      console.log("variPrefs", pixelBlocksArray[0][0].variPrefs);
      console.log("currentColorGoal", pixelBlocksArray[0][0].currentColorGoal);
    } else{
      console.log("timerToggle", timerToggle);
      console.log("");
    }
  }
}

function setup(){
  frameRate(FPS);
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  genAllPixelBlocks();
  baseSetTime = mRandom(baseTimeMinMax[0], baseTimeMinMax[1]);
  // console.log("pixelBlocksArray", pixelBlocksArray);
  // console.log("pixelBlockCount", pixelBlockCount);
}

function draw(){
  textAlign(CENTER, CENTER);
  text("If you can see this then that means you screwed up the inputs. Try refreshing the page", windowWidth / 2, windowHeight / 2, )
  let outLine = [...pixelBlocksArray[0][0].baseColor]; // might as well be one global var
  outLine[2] += 4;
  background(outLine); // wow this really improves everything
  // background(pixelBlocksArray[0][0].baseColor);
  checkBaseTimer();

  // loops through every pixelBlock, asks it to update its properties and draw
  for (let layer of pixelBlocksArray){
    for (let layerPos of layer){
      layerPos.update();
      layerPos.show();
    }
  } // end loop de loops
}
