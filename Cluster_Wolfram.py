#!/usr/bin/python

# This script takes input from Javascript (???)
# The input is of the form of a JSON, containing set of 3D coords for graphing
# This script parses the JSON, feeds it to fetcher.py, then returns the sorted array (JSON?) back to Javascript (???)

import json

# Given from Javascript:	[["col1","col2","col3"],["x1","y1","z1"],["x2","y2","z2"], ... ]
# Format of call to Wolfram:	FindClusters[ (1,-8,2),(2,4,1) (100,-10,1) (50,20,3) (3,2,31) (5,1,8) (60,0,13) (0,3,250 }]
# Give back to Javascript:	Also JSON?

def get(jstr):
	parsed_string = json.loads(jstr)
	
