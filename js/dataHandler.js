// This data will get the data from the page, pass it to weatherstem, then pass it to mathematica, and then handle the import() call from sergei's code.
var data = "";
var stations = ["parkforest"];

function importPlease() {
  return data;
}


// When the user pushes the button...
function onSubmitRequest(from_date, to_date, sensors) {
  weatherstemRequest(stations, from_date, to_date, sensors, function(weatherstemData){
    
    data = weatherstemData.slice(1,31);
    
    /*
    callToAmarsCode(weatherstemData, function(wolframData) {
      data = wolframData;
    }*/
    
  });
}