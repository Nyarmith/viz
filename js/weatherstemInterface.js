var api_key = "1yq3rd1g";
var data_lim = 30;


function weatherstemRequest(stations, from_date, to_date, sensors, success_callback, error_callback)
{
  jsonRequest = {
    "api_key" : api_key,
    "stations" : stations,
    "from" : from_date,
    "to" : to_date,
    "sensors" : sensors    
  };
  
  console.log(JSON.stringify(jsonRequest));
  
  $.ajax({
    type: "POST",
    url: "http://centre.weatherstem.com/api",
    data: JSON.stringify(jsonRequest),
    dataType: "json",
    success: function(responseData, textStatus, jqXHR) {
      success_callback(responseData[0].records, textStatus, jqXHR);
    },
    error: function(responseData, textStatus, errorThrown) {
      error_callback(responseData, textStatus, errorThrown); 
    }
  });
}