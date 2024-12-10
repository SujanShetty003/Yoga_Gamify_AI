let brain;
let asanas;

function setup() {
    // this specifies the parameters of the ml5 NN
    let options = {
        inputs: 34,
        // update this to match the amount of different poses
        outputs: 20,
        task: "classification",
        debug: true,
    };
    // this loads the ml5 Neural Network model with the options specified and the files uploaded
    brain = ml5.neuralNetwork(options);
    const modelInfo = {
        model: "./model.json", // './model/model.json',
        metadata: "./model_meta.json", // './model/model_meta.json',
        weights: "https://cdn.glitch.global/e6659bd5-94b1-4dbc-94f9-5468bd8f317d/model.weights.bin?v=1642380976991",
    };
    brain.load(modelInfo, nnLoaded);
  
    // FETCH DATA FROM JSON AND STORE INTO ASANAS (= AN JS ARRAY OF OBJECTS)
  fetch("asanas.json")
    .then((response) => response.json())
    .then(function (data) {
      asanas = data;
    });
}

function nnLoaded(){
  sendBack({
    action: "loaded",
    action_id: Date.now()
  })
}

window.onmessage = function(e) {
  var d;   
  try{
      d=JSON.parse(e.data);
  }catch(err){
    return null;
  }
  
  //console.log("ifr", d)
  if(d.action == "classify"){
    if(d.data){
      let inputs = [];
      for (let i = 0; i < d.data.keypoints.length; i++) {
        let x = Math.round(d.data.keypoints[i].x);
        let y = Math.round(d.data.keypoints[i].y);
        inputs.push(x);
        inputs.push(y);
      }
      
      // it then asks the NN to classify based on the data in inputs and run gotResult function when done
      brain.classify(inputs, (u,dat)=>{
        result(u, dat, d.action_id)
      })
    }
  }
}

function result(err, out, action_id){
  sendBack({
    action: "result",
    action_id: action_id,
    data: out
  })
}

function sendBack(obj){
  window.top.postMessage(JSON.stringify(obj), '*')
}