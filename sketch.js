/*
Project started Aug-2-2021

Hexagons will be drawn in ⬡ the diamond position. Where the point goes up

sudo code

take screen resolution

prompt user
  pixel to screen scaling resolution
  starting dominant color
  dominant color pallette min max values
  individual pixel block color variance min maxs

for loop that uses x and y render scaling to create all pixelBlocks
  create them in an array
  tell each its XY cord

function to create new color (variantColorBase)
  for color creation use HSB
  minHue;
  maxHue;

  minSat;
  maxSat;

  minVal;
  maxVal;

  if (variantColorBase === undefined){
    color(random(min max all the things))
    return domColorGoal or just call it domColor
  } else {
    use individual pixel block color variance values

    use random min max to find change budget for all values (in HSB)

    loop through HSB array
      random add or subtract value to value from budget
      also check if adding or subtracting this val would set it across the min-
      -max border, if so do the opposite subtract or add

    return colorVariGoal
  }

*/


function mRandom (min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); 
  //The maximum is inclusive and the minimum is inclusive
}

function checkEqual (array1, array2){
  for (let i = 0; i < array1.length; i++){
    if (array1[i] != array2[i]) {
      return false;
    } else {
      return true;
    }
  }
}

function genColor (variantColorBase){
  colorMode(HSB); // I know HSV makes more sense but p5 uses HSB
  let HSBPrefs = [
    0,360, // don't change this for now // HUE
    35,65, // might change this            Saturation
    62,85 // might change this            Brightness
  ];
  // Have a way to implement color palettes
  // option to display palette colors in order or randomly scattered
  //  if they are randomly scattered their frequency should be tied to their saturation
  //  or a per color custom weight(?) frequency

  let HSBVariPrefs = [
    -40,40
    -10,10, // not sure on these last 4 or really any of these
    -15,15
  ];

  function checkOverFlow (val, type){ //checks if HSB val is out of bounds and corrects it
    // if (val > 100 && type != 'H') {
    //   console.log('theres an invalid checkOverFlow() input somewhere')
    //   console.log("val", val)
    //   console.log("type", type)
    // }

    let valLimit;
    let min;
    let max;
    if (type == 'H') {
      valLimit = 360;// limit, as in the limit of this value type
      min = HSBPrefs[0];
      max = HSBPrefs[1];
    } else if (type == 'S') {
      valLimit = 100
      min = HSBPrefs[2];
      max = HSBPrefs[3];
    } else if (type == 'B') {
      valLimit = 100
      min = HSBPrefs[4];
      max = HSBPrefs[5];
    } 

    if(val > max){
      // console.log("Max val hit", val, type);
      if (type == 'H') {
        return (val - valLimit); // Hue loops
      } else {
        return (max)
      } // Saturation and brightness ar limited to max
    } else if (val < min){
      // console.log("Min val hit", val, type);
      if (type == 'H') {
        return (valLimit + val);
      } else {
        return (min)
      }
    } else {
      return val // color passed all checks no changes needed
    }
  } // end of checkOverFlow


  if (variantColorBase === undefined){ // creates new random color
    let domColor = [
      mRandom(HSBPrefs[0], HSBPrefs[1]),
      mRandom(HSBPrefs[2], HSBPrefs[3]),
      mRandom(HSBPrefs[4], HSBPrefs[5])
    ];
    return domColor;
  } else { // adjust variantColorBase to create a slightly different color

    let HSB = ['H', 'S', 'B']
    let variColor = []

    let j = 0;
    for (let i = 0; i < 3; i++){ // creates new color by randomizing all three vals
      variColor.push(
        checkOverFlow( // check overflow also solves overflows
          variantColorBase[i] + mRandom(HSBVariPrefs[j], HSBVariPrefs[j + 1]),
          HSB[i]
        )
      );
      j += 2;
    }

    return variColor;
  }

} // end of genColor



class pixelBlock{
  constructor (position, domColor, sideLen, hexWidth, ID){
    this.ID = ID;
    this.position = position;
    this.domColor = domColor;
    this.currentColor = [this.domColor[0], this.domColor[1], this.domColor[2]];
    this.currentColorGoal = [this.domColor[0], this.domColor[1], this.domColor[2]];
    this.goalType = "vari"; // approaching variation or dominant color


    this.setGoal = function(inputColor ) {
      this.currentColorGoal = inputColor;
    }

    // May not be necessary if we just set colorDom to a global var
    this.setDom = function(inputDom) {
      this.domColor = inputDom;
      this.setGoal(this.domColor);
    }

    this.genVari = function() {
      let newVari = genColor(this.domColor);
      this.setGoal(newVari);
    }

    this.update = function() {
      // check if currentColor has reached currentColorGoal
      if (checkEqual(this.currentColor, this.currentColorGoal)){
        // generates new vari color and sets it as current ColorGoal
        if (this.goalType == "dom") {
          this.goalType = "vari"
          this.genVari();
        // sets color goal to dom. Does not generate new dom
        } else if (this.goalType == "vari") {
          this.goalType = "dom"
          this.setGoal(this.domColor);
        // catches input error. Sets color goal to dom
        } else {
          console.log("###########################")
          console.log("Error pixelBlock", this.position, "invalid this.goalType")
          console.log("###########################")
          this.goalType = "dom"
          this.setGoal(this.domColor);
        }
      } else {

        if (Math.abs(this.currentColorGoal[0] - this.currentColor[0] > 180)){
          this.currentColor[0] -= mRandom(0,4);
        } else if (Math.abs(this.currentColor[0] - this.currentColorGoal[0] > 180)){
          this.currentColor[0] += mRandom(0,4);
        } else if(this.currentColor[0] < this.currentColorGoal[0]){
          this.currentColor[0] += mRandom(0,3)
        } else if (this.currentColor[0] > this.currentColorGoal[0]){
          this.currentColor[0] -= mRandom(0,3)
        } // if neither then they're even

        if (this.currentColor[0] <= 0){
          this.currentColor[0] = 360
        } else if (this.currentColor[0] >= 360){
          this.currentColor[0] = 0
        }

        for (let i = 1; i < 3; i++){
          if(this.currentColor[i] < this.currentColorGoal[i]){
            this.currentColor[i] += mRandom(0,2)
          } else if (this.currentColor[i] > this.currentColorGoal[i]){
            this.currentColor[i] -= mRandom(0,2)
          } // if neither then they're even
        }


      }

      // // steps currentColor slightly closer to currentColorGoal
      // let maxStep = 10;
      // let currentStepBudget = mRandom(0, maxStep);

      // // generates three random percentages to equally distribute steps from cSB
      // let RGBStepRatio = [mRandom(0, 100), mRandom(0, 100), mRandom(0, 100)];
      // let sum = RGBStepRatio.reduce((a, b) => a + b);
      // for (let i = 0; i < 3; i++){
      //   RGBStepRatio[i] = (RGBStepRatio[i] * sum) * currentStepBudget;
      // }




      // for(let i = 0; i < 3; i++){
      //   let posOrNeg = Math.round(Math.random()) * 2 - 1
      //   this.tempColorGoal[i] = this.tempColor[i] + posOrNeg * RGBStepRatio[i];
      // }

      // colorMode(RGB);
      // this.currentColorGoal

      //divide RGBShiftChange into three random parts
      // randomly add them to an RGB val
        // if this addition went over the currentColorGoal set it to that goal and
        // ignore the left over budget. Or maybe take that budget and put it 
        // towards the other colors, could be more work then its worth though
    }

    this.show = function() {
      stroke(this.domColor);
      strokeWeight(3);
      fill(this.currentColor);
      push(); // saves current canvas configs
        // NOTE this draws a hex at the center of a given position
        // translate(transX, transY);
        translate(this.position[0], this.position[1]);
        // rotate(rotation);
        rotate(90);
        beginShape();  
          vertex(-sideLen/2, -hexWidth);
          vertex(sideLen/2, -hexWidth);
          vertex(sideLen, 0);
          vertex(sideLen/2, hexWidth);
          vertex(-sideLen/2, hexWidth);
          vertex(-sideLen, 0);
        endShape(CLOSE); 
      pop(); // resets all changes to past canvas configs
    } // end of show function

  } // end of constructor
} // end of class

let pixelBlocksArray = []
function genAllPixelBlocks() { // TO DO FINISH lol
  // if the scale = 16 there will be 16 equally sized hexagons. Their size is
  // solved from taking windowHeight and dividing it by the scale var
  // I could just rename this to be hexagons on y/x axis

  // I'm using windowHeight since its easier to solve for side length with the 
  // hexagon orientation I'm using ⬡ ⬢


  // should all hexs contained writhen the window or should they continue  
  // partly off screen?
  let solidCount;
  if (confirm("Would you like to use custom inputs? Press cancel for default")){
    solidCount = prompt("(full no clip) Hex X axis count");
  } else {
    if (windowWidth > windowHeight){
      solidCount = 35;
    } else {
      solidCount = 20
    }
  }

/*
  problem there are two x axis counts
  also making a perfect consistent hexagon grid is hard as
  example:
    }{}{}{}{ 6
    {}{}{}{} 5
    }{}{}{}{ 6

    {}{}{}{} 5
    }{}{}{}{ 6
    {}{}{}{} 5

  because of how hexagons interlock we will always have clipped hexagons.
  the can also be clipped horizontally which is also fun
  even more fun both x layers can be clipped simultaneously
    {}{}{}{ 4
    }{}{}{} 4
    {}{}{}{ 4

    we can avoid these by only allowing the user to input a whole number
*/

  clipCount = solidCount + 1
  // note hexagons will be drawn from their center. the starting layer will always clip
  let hexWidth = (windowWidth / solidCount) / 2; 
  let hexSide =  hexWidth / Math.acos(30 * (PI/180))

  // three stacked hex sides is equal to two layers
  let layerCount = Math.ceil(((((windowHeight - hexSide) / hexSide) / 3) * 2) + 1)
  console.log("layerCount", layerCount);

  //hexYCount = windowHeight / hexSide;


  let tempDom = genColor();

  for (let layer = 0; layer < layerCount; layer++){
    pixelBlocksArray.push([])

    if (layer % 2 != 0){ 
      for (let layerPos = 0; layerPos < clipCount; layerPos++){ 
        pixelBlocksArray[layer].push(
          new pixelBlock(
            [
              (layerPos * (hexWidth * 2)),
              // I'm subtracting sideLen to fix the offset from clipping the first layer
              (layer * hexSide * 1.5)
            ],
            tempDom,
            hexSide,
            hexWidth,
            [layerPos, layer]
          )
        );
      }
    } else {
      for (let layerPos = 0; layerPos < solidCount; layerPos++){ 
        pixelBlocksArray[layer].push(
          new pixelBlock(
            [
              // layerPos * (hexWidth * 2),
              (layerPos * (hexWidth * 2)) + hexWidth,
              layer * (hexSide * 1.5)
            ],
            tempDom,
            hexSide,
            hexWidth,
            [layerPos, layer]
          )
        );
      }
    }

  } // end loop de loops




} // end of genAllPixelBlocks


let FPS = 60;
let frameCountStart = 0;
let domTimeMinMax = [10, 20] // in seconds
let domSetTime;

function checkDomTimer(overRide){
  // calcs frames since start or last reset
  let framesSince = frameCount  - frameCountStart;

  // if the domSetTime is reached a new dom color is generated and set to the PBs
  if (framesSince > domSetTime * FPS || overRide != undefined){
    let newDom = genColor();
    background(newDom);
    for (let xAxis = 0; xAxis < pixelBlocksArray.length; xAxis++){
      for (let yAxis = 0; yAxis < pixelBlocksArray[xAxis].length; yAxis++){
        pixelBlocksArray[xAxis][yAxis].setDom(newDom);
      }
    } // end of loops

    // resets dom timer
    domSetTime = mRandom(domTimeMinMax[0], domTimeMinMax[1]);
    // console.log("new domSetTime", domSetTime)
    frameCountStart = frameCount;
  }
}

function touchStarted() {
  checkDomTimer("reeeeee");
}

function setup() {
  angleMode(DEGREES)
  createCanvas(windowWidth, windowHeight);
  genAllPixelBlocks();
  frameRate(FPS);
  domSetTime = mRandom(domTimeMinMax[0], domTimeMinMax[1]);
  console.log("domSetTime", domSetTime)
  console.log("pixelBlocksArray", pixelBlocksArray);
}

function draw() {
  checkDomTimer();

  // loops through every pixelBlock, asks it to update its properties and draw
  for (let layer of pixelBlocksArray){
    for (let layerPos of layer){
      layerPos.update();
      layerPos.show();
    }
  } // end loop de loops
}
