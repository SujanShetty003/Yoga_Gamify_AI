// this bit allows all the empty variables until theyre filled so js doesnt give us errors
let video, canvas;
let detector;
let poseNet;
let pose;
let skeleton;
let poseLabel = "pose";
let text = "oki";
let poseScore = "0";
let synth = window.speechSynthesis;
let asanas;
let selectedWriteMode;
let selectedSpeakMode;
let lastPoseLabel;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// CHECKING USER-DEFINED MODE TROUGH RADIO BUTTONS SET IN HTML
// GETTING ALL RADIO BUTTONS ELEMENTS HAVING INPUT NAME write-mode
document.querySelectorAll('input[name="write-mode"]').forEach((elem) => {
  // ADDING CHANGE EVENT LISTENER ON RADIO BUTTON ELEMENTS
  elem.addEventListener("change", function (event) {
    // PUSHING VALUE FROM BUTTON INTO SELECTEDMODE GLOBAL VAR
    selectedWriteMode = event.target.value;
    // display selected mode below the buttons in HTML
    select("#selected-write-mode").html(
      "You have selected:" + selectedWriteMode + ""
    );
  });
});

// GETTING ALL RADIO BUTTONS ELEMENTS HAVING INPUT NAME write-mode
document.querySelectorAll('input[name="speak-mode"]').forEach((elem) => {
  // ADDING CHANGE EVENT LISTENER ON RADIO BUTTON ELEMENTS
  elem.addEventListener("change", function (event) {
    // PUSHING VALUE FROM BUTTON INTO SELECTEDMODE GLOBAL VAR
    selectedSpeakMode = event.target.value;
    // display selected mode below the buttons in HTML
    select("#selected-speak-mode").html(
      "You have selected:" + selectedSpeakMode + ""
    );
  });
});

async function startMoveNet(){
  const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
  
  posenetLoaded();

  return setInterval(async ()=>{
    var pos = await detector.estimatePoses(video.elt);
    gotPoses(pos);
  }, 100)
}

// ___ START P5 SETUP
// this runs the p5 setup function. it draws the canvas, makes it an element we can place in HTML page, and loads the video inside
function setup() {
  canvas = createCanvas(640, 480); // 640x480
  canvas.parent("webcam");
  video = createCapture(VIDEO);
  //video.hide();
  // this loads the PoseNet model from ml5 and runs the posenetLoaded function when its done
  // poseNet = ml5.poseNet(video, posenetLoaded);
  startMoveNet()

  // FETCH DATA FROM JSON AND STORE INTO ASANAS (= AN JS ARRAY OF OBJECTS)
  fetch("asanas.json")
    .then((response) => response.json())
    .then(function (data) {
      asanas = data;
    });
}
// ___ END P5 SETUP

// this runs when the PoseNet model is loaded and pushes the status into posenet status div
function posenetLoaded() {
  select("#status-posenet").html("✅ MoveNet Loaded");
}

window.onmessage = function(e) {
  var d;   
  try{
      d=JSON.parse(e.data);
  }catch(err){
    return null;
  }
  
  //console.log("top", d)
  if(d.action == "loaded"){
    nnLoaded();
  }else if(d.action=="result"){
    _results[d.action_id] = d
  }
}

function send(obj){
  document.getElementsByTagName("iframe")[0].contentWindow.postMessage(JSON.stringify(obj), '*')
}

// this runs when the NN is loaded and pushes the status into the nn status div
function nnLoaded() {
  select("#status-nn").html("✅ Asana Neural Network Loaded");
  // this says to run the classifyPose function - 1st time
  classifyPose();
}

// this stores the first result of poses into pose + skeleton
function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0];
    //skeleton = poses[0].skeleton;
    skeleton = []
  }
}

// this function grabs the 17 keypoints from pose and stores their x and y position into inputs
async function classifyPose() {
  var id = Date.now();
  send({
    action: "classify",
    action_id: id,
    data: pose
  })
  
  if(pose){
    var res = await awaitResult(id)
    gotResult(undefined, res.data)
  }
  
  await sleep(200)
  requestAnimationFrame(classifyPose);
}

var _results = {}
async function awaitResult(id){
  var done = false;
  while(!done){
    await sleep(200)
    if(_results[id]){
      done = true;
      return _results[id]
    }
  }
}

function gotResult(error, results) {
  if (results && results[0].confidence > 0.85) {
    poseLabel = results[0].label;
    poseScore = results[0].confidence.toFixed(2);

    // this tells it to run the writePose & writeInfo functions
    if (lastPoseLabel !== poseLabel) {
      // speakInfo();
      setTimeout(speakInfo, 500);

    }
      lastPoseLabel = results[0].label;
      writePose();
      writeInfo();
  }
}

// this function processes & displays the classification result (the label + confidence)


function getFilteredAsana() {
  return asanas.find((obj) => {
    return obj.label === poseLabel;
  });
}

function writePose() {
  // CHECKING SELECTEDWRITEMODE IF IT'S english
  if (selectedWriteMode === "write-english-pose") {
    const filteredAsana = getFilteredAsana();
    text = filteredAsana["english"];
    select("#pose").html("" + text + "");
    select("#confidence").html("" + poseScore * 100 + " %");
  }
  // CHECKING SELECTEDWRITEMODE IF IT'S sanskrit
  // PROBLEM HERE: if the mode is English it keeps looping; if its in Sanskrit it freezes?! no idea why :(
  else {
    // if (selectedWriteMode === "write-sanskrit-pose")
    const filteredAsana = getFilteredAsana();
    text = filteredAsana["sanskrit"];
    select("#pose").html("" + text + "");
    select("#confidence").html("" + poseScore * 100 + " %");
  }
  const filteredAsana = getFilteredAsana();
  text = filteredAsana["emoji"];
  select("#emoji").html("" + text + "");
}

function writeInfo() {
  const filteredAsana = getFilteredAsana();
  text = filteredAsana["body"];
  select("#benefits-body").html("" + text + "");
  text = filteredAsana["mind"];
  select("#benefits-mind").html("" + text + "");
  text = filteredAsana["organs"];
  select("#benefits-organs").html("" + text + "");

  text = filteredAsana["cues"];
  select("#cues").html("" + text + "");
  text = filteredAsana["followUp"];
  select("#followUp").html("" + text + "");
}

// SPEAK INFO FUNCTION
function speakInfo() {
  const filteredAsana = getFilteredAsana();
  // initialize the utter speech function
  let utter = new SpeechSynthesisUtterance();
  //  UTTER SETTINGS
  utter.lang = "en-US"; // en-US
  utter.rate = 1.0;
  utter.volume = 0.5;
  // utter.text = text;
  if (selectedSpeakMode === "speak-sanskrit-pose") {
    utter.text = filteredAsana["sanskrit"];
    utter.rate = 0.8;
    utter.lang = "hi-IN"; // en-US
  }
  if (selectedSpeakMode === "speak-benefits-body") {
    utter.text = filteredAsana["body"];
  }
  if (selectedSpeakMode === "speak-benefits-mind") {
    utter.text = filteredAsana["mind"];
  }
  if (selectedSpeakMode === "speak-benefits-organs") {
    utter.text = filteredAsana["organs"];
  }
  if (selectedSpeakMode === "speak-cues") {
    utter.text = filteredAsana["cues"];
  }
  //  THE ACTUAL SPEAKING
  window.speechSynthesis.speak(utter);

  // SPECIFY WHAT TO DO WHEN UTTER IS DONE > LOOP CLASSIFY??? IDK
  // utter.onend = function () {
  //    // classifyPose();
  //   // setTimeout(speakInfo, 2000);
  // };
}

// ___ START P5 DRAW
// this draws the webcam, keypoints, and skeleton on screen every second
function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    // this one draws the skeleton lines between keypoints
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0]; // this takes the x from every keypoint
      let b = skeleton[i][1]; // this takes the y from every keypoint
      strokeWeight(2);
      stroke(128, 255, 204);

      line(a.x, a.y, b.x, b.y);
    }
    // this one draws the 17 keypoints
    if (pose.keypoints) {
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].x;
        let y = pose.keypoints[i].y;
        fill(128, 255, 204);
        noStroke();
        ellipse(x, y, 16, 16);
      }
    }
  }
}

// IGNORE CODE SNIPPETS BELOW - THEYRE LIKE MY NOTES :)

// ___ END P5 DRAW

// // FOR ADDING DELAY TO THE RESPONSE I CAN USE THIS
// setTimeout(() => {
// console.log(selectedMode, "1 sec delay");
// // HERE YOU CAN WRITE YOUR LOGIC WHICH WILL RUN AFTER SPECIFIED DELAY TIME IN THIS CASE ITS 1000 = 1 sec
// }, 1000);

// another way of grabbing json - not sure of benefits of this over the one in setup
// window.addEventListener('DOMContentLoaded', (event) => {
//     // FETCH DATA FROM JSON AND STORE INTO ASANAS (= AN JS ARRAY OF OBJECTS)
//   fetch("asanas.json")
//   .then(response => response.json())
//   .then(function(data){
//     asanas = data;
//   });
//   console.log('DOM fully loaded and parsed');
// });
