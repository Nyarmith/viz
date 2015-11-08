#!/usr/bin/env python
# -*- coding: utf-8 -*-
import wap

# IMPORTANT
# This file was originally written by wolfram (not us)
# Some example files were included to show how to access Wolfram API,
#	and this is a heavily edited example file.

# Edits that need to be made:
#	Currently file takes str input
#		-> should be made a function
#	Outputs Pod.title, img.src, img.alt for input and result
#		-> should return img.alt for result

# Find clusters
def fc(data):
	input = data

	server = 'http://api.wolframalpha.com/v2/query.jsp'
	with open('../../APPID') as f:
		appid = f.readline().strip()

	# Need to further parse data; maybe?

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
