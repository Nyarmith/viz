# viz
Data science visualization educational app for hack psu 2015

We obtain historical weather data for certain location from WeatherSTEM API.
The data will be in sets of three, so one can observe the existence or lack of
correlation between groups of different atmospheric conditions.

We then use the Wolfram Mathematica API to cluster data together (to make data visualization easier).

The Wolfram API is dealt with using their released Python binding, while the weatherSTEM API
is accessed primarily by JQuery.
