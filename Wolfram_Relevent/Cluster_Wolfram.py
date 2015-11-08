#!/usr/bin/python

# This script takes input from Javascript (???)
# The input is of the form of a JSON, containing set of 3D coords for graphing
# This script parses the JSON, feeds it to fetcher.py, then returns the sorted array (JSON?) back to Javascript (???)

import json
from fetcher import fc

# Given from Javascript:	e.g. [["Record ID","10 Minute Wind Gust","Heat Index"],["266257","16","69.0"],["266259","15","69.0"]]
# Format of call to Wolfram:	FindClusters[ (1,-8,2), (2,4,1), (100,-10,1), (50,20,3), (3,2,31), (5,1,8), (60,0,13), (0,3,250) ]
### NOOO
# it's like this:
#	FindClusters[{ {1,-8,2}, {2,4,1}, {100,-10,1}, {50,20,3} }]
# Format of return from API:	{(1 | -8 | 2 2 | 4 | 1 5 | 1 | 8), (100 | -10 | 1 50 | 20 | 3 60 | 0 | 13), (3 | 2 | 31 0 | 3 | 250)}
# Give back to Javascript:	Also JSON?

def get(jstr):
	parsed = json.loads(jstr)
	parsed.pop(0)

	p = []
	q = [0.0]*3

	for row in parsed:
		for idx, e in enumerate(row):
			q[idx] = float(str(e))
		p.append( (q[0], q[1], q[2]) )

	ret = "[{"
	for i in p:
		ret = ret + str(i) + ","
	ret = "FindClusters" + ret[:len(ret)-1] + "}]"

	# not really
	# return ret	# correct !

	return str( fc(ret) )	
