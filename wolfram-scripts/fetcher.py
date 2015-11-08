#!/usr/bin/python
# -*- coding: utf-8 -*-
import wap
import json

# IMPORTANT
# The first function in this file was originally written by wolfram (not us) !
# Some example files were included to show how to access Wolfram API,
#	and this is a slightly edited example file.

##################
##
## Find clusters of data
##
##	Input:	Complete Wolfram query ~ FindClusters[{ {x1,y1,z1}, {x2,y2,z2} ... }]
##	Output: Set of arrays sorted into clusters
def FC(data):
	input = data

	server = 'http://api.wolframalpha.com/v2/query.jsp'
	with open('../../APPID') as f:
		appid = f.readline().strip()

	# Need to further parse data; maybe?	Nope! Unless we want timestamps ... :(

	waeo = wap.WolframAlphaEngine(appid, server)

	queryStr = waeo.CreateQuery(input)
	wap.WolframAlphaQuery(queryStr, appid)
	result = waeo.PerformQuery(queryStr)
	result = wap.WolframAlphaQueryResult(result)

	for pod in result.Pods():
		waPod = wap.Pod(pod)
		title = "Pod.title: " + waPod.Title()[0]
		#print title
		for subpod in waPod.Subpods():
			waSubpod = wap.Subpod(subpod)
			plaintext = waSubpod.Plaintext()[0]
			img = waSubpod.Img()
			src = wap.scanbranches(img[0], 'src')[0]
			alt = wap.scanbranches(img[0], 'alt')[0]
			#print "-------------"
			#print "img.src: " + src
			#print "img.alt: " + alt
			if ( title.strip() == "Pod.title: Result" ):
				return alt;
		#print "\n"

	# Never got a result :(
	return 0;

##################
##
##	Interface function between FC (Find_Clusters) and JQuery/Javascript frontend.
##	Will accept JSON, then do heavy lifting of converting to viable Mathematica query.
##	After receiving result from FC, re-parses into (JSON? tuple?) for data visualizer to receive
##
##		Formats:
##
## Given from Javascript:	e.g. [["Record ID","10 Minute Wind Gust","Heat Index"],["266257","16","69.0"],["266259","15","69.0"]]
## Format of call to Wolfram:	FindClusters[{ {1,-8,2}, {2,4,1}, {100,-10,1}, {50,20,3} }]
## Format of return from API:	{(1 | -8 | 2 2 | 4 | 1 5 | 1 | 8), (100 | -10 | 1 50 | 20 | 3 60 | 0 | 13), (3 | 2 | 31 0 | 3 | 250)}
## Give back to visualizer:		Also JSON?
def IFace(jstr):
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

	return str( FC(ret) )

##################
##
##  Secondary interface function:
##	Takes the same JSON as IFace, but returns a string tuple(?) containing field values for graph clarity.
##
def Fields(jstr):
	parsed = json.loads(jstr)

	q = [""] * 3

	for idx, e in enumerate(parsed[0]):
		q[idx] = str(e)
	return ( (q[0], q[1], q[2]) )
