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
  // let CVAdjust = [0.01 * mRandom(0, 10), 0.01 * mRandom(0, 10)]; // for gray colors
  let CVAdjust = [0.01 * mRandom(20, 60), 0.01 * mRandom(0, 15)]; // adjusts by percentage
  let tempColorVariance = [
    Math.floor(colorVariance * CVAdjust[0]),
    Math.ceil(colorVariance * CVAdjust[1])
  ];
  let saturation = [mRandom(5, 20), mRandom(5, 20)];
  // let brightness = [mRandom(2, 5), mRandom(4, 10)];

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

  let variPrefs = [
    -tempColorVariance[0], tempColorVariance[1],
    -saturation[0], saturation[1],
    -1, 1 // adjusting all three lead to a lot of noise
    // -brightness[0], brightness[1]
  ];
  return variPrefs;
}

function genColor (colorBase, variPrefs, largeColorChange){
  colorMode(HSB); // I know HSV makes more sense but p5 uses HSB
  let HSBPrefs = [
    // grey mode  change saturation random range in variPrefs rM(0,10)
    // 0,360, //  HUE  don't change this
    // 2,5, //  Saturation
    // 10,30  //  Brightness

    // // pastels
    // 0,360, //  HUE  don't change this
    // 0,20, //  Saturation
    // 90,100  //  Brightness

    // new better settings
    0, 360, //  HUE  don't change this
    20,80, //  Saturation
    65,95, //  Brightness
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

let colorVariance = 100
// let colorVariance = prompt(
//   "Input Color variance. Recommended ~100, cancel for default"
// );
// if (colorVariance == undefined){
//   colorVariance = 100;
// }
class pixelBlock{
  constructor(position, baseColor, variPrefs, sideLen, hexWidth, ID){
    this.ID = ID;
    this.position = position;
    this.baseColor = baseColor;
    this.currentColor = [
      this.baseColor[0],
      this.baseColor[1],
      this.baseColor[2]
    ];
    this.currentColorGoal = [
      this.baseColor[0],
      this.baseColor[1],
      this.baseColor[2]
    ];
    this.goalType = "vari"; // approaching variation or base color
    this.variPrefs = variPrefs;

    // this.variPrefs = [
    //   -colorVariance,colorVariance
    //   -10,10, // not sure on these last 4 or really any of these
    //   -10,10
    // ];

    this.setGoal = function (inputColor){
      this.currentColorGoal = inputColor;
    };

    // May not be necessary if we just set colorBase to a global var
    this.setBase = function (inputBase){
      this.baseColor = inputBase;
      this.setGoal(this.baseColor);
    };

    this.setVariPrefs = function (inputPrefs){
      this.variPrefs = inputPrefs;
    };

    this.genVari = function (){
      this.setGoal( genColor(this.baseColor, this.variPrefs) );
    };

    this.update = function (){
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
            this.currentColor[i] += mRandom(0, 1);
          } else if (this.currentColor[i] > this.currentColorGoal[i]){
            this.currentColor[i] -= mRandom(0, 1);
          } // if neither then they're even
        }
      }
    };

    let halfSideLen = sideLen / 2 // optimization at its best
    this.show = function (){
      // stroke(this.baseColor);
      noStroke();
      fill(this.currentColor);
      push(); // saves current canvas configs
        // NOTE this draws a hex at the center of a given position
        translate(this.position[0], this.position[1]);
        scale(0.95)
        // rotate(rotation);
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
    }; // end of show function
  } // end of constructor
} // end of class

let pixelBlockCount = 0;
let pixelBlocksArray = [];
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
      "Input Color variance. Recommended ~100, cancel for default"
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

  let tempBase = genColor();
  let tempVariPref = genVariPrefs();

  for (let layer = 0; layer < layerCount; layer++){
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
    } else{
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
  } // end of all loops
} // end of genAllPixelBlocks

let FPS = 30;
let frameCountStart = 0;
let baseTimeMinMax = [10, 20]; // in seconds
let baseSetTime;

let timerToggle = true;

function checkBaseTimer(overRide, compColor){
  // calcs frames since start or last reset
  let framesSince = frameCount - frameCountStart;

  if (timerToggle == true){
    // if the baseSetTime is reached a new base color is generated and set to the PBs
    if (framesSince > baseSetTime * FPS || overRide != undefined){
      let newVariPrefs = genVariPrefs();
      let newBase = genColor();
      if (mRandom(0, 4) == 1 || compColor){
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
      // console.log("new baseSetTime", baseSetTime)
      frameCountStart = frameCount;
    }
  }
}

function touchStarted(){
  // checking frame count prevents detecting a touch event twice
  if (timerToggle && frameCount - frameCountStart > FPS / 16){
    checkBaseTimer("overRide");
  } else if (!timerToggle){
    console.log("Scene generation is paused, press space to unpause");
  } else{
    console.log("You're tapping too fast!");
  }
}

/*
let displayTime = 4 * FPS;
let frameCountStartDT = 0;
let promptToggle = timerToggle;
function sceneToggleUserPrompt(){
  let timeDisplayed = frameCount - frameCountStartDT
  if (displayTime < timeDisplayed){
    promptToggle = !promptToggle
  }
  if (!timerToggle && promptToggle){
    push();
      rectMode(CENTER);
      fill(genColor(pixelBlocksArray[0][0].baseColor));
      rect(windowWidth / 2, windowHeight * (0.0656), 390, 100);
      textAlign(CENTER, BOTTOM);
      textSize(32);
      stroke('gray')
      fill('white');
      text(
        "Scene generation paused", 
        windowWidth / 2, 
        windowHeight * (1 / 16)
      );
      textSize(20);
      text(
        "Press space to unpause", 
        windowWidth / 2, 
        (windowHeight * (1 / 16)) + 23
      );
    pop();
  }
}
*/

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
    timerToggle = !timerToggle; // flips toggle to pause
    promptToggle = timerToggle;
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
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  genAllPixelBlocks();
  baseSetTime = mRandom(baseTimeMinMax[0], baseTimeMinMax[1]);
  console.log("pixelBlocksArray", pixelBlocksArray);
  console.log("pixelBlockCount", pixelBlockCount);
}

function draw(){
  textAlign(CENTER, CENTER);
  text("If you can see this then that means you screwed up the inputs. Try refreshing the page", windowWidth / 2, windowHeight / 2, )

  background(color(pixelBlocksArray[0][0].baseColor))
  checkBaseTimer();

  // loops through every pixelBlock, asks it to update its properties and draw
  for (let layer of pixelBlocksArray){
    for (let layerPos of layer){
      layerPos.update();
      layerPos.show();
    }
  } // end loop de loops
}
