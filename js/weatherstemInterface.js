var api_key = "1yq3rd1g";
var data_lim = 30;

function weatherstemRequest(stations, from_date, to_date, sensors, success_callback, error_callback)
{
  jsonRequest = {
    "api_key" : api_key,
    "stations" : stations,
    "from" : "2014-05-08 10:00:00",
    "sensors" : sensors    
  };
  
  console.log(JSON.stringify(jsonRequest));
  
  $.ajax({
    type: "POST",
    url: "http://centre.weatherstem.com/api",
    data: JSON.stringify(jsonRequest),
    dataType: "json",
    success: function(responseData, textStatus, jqXHR) {
      success_callback(responseData[0], textStatus, jqXHR);
    },
    error: function(responseData, textStatus, errorThrown) {
      error_callback(responseData[0], textStatus, errorThrown); 
    }
  });
}