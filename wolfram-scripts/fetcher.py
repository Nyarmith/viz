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
##	NOTE : This function is meant to be the MAIN function of this file.
##			All commands you issue should be able to be handled by IFace() (and Fields())
##
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
#		Different dependent on data type: ({266257., 16., 69.} | {266259., 15., 69.})
## Give back to visualizer:		Array of arrays
def main(jstr):
	#jstr = raw_input()
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
	ret = "FindClusters" + ret[:len(ret)-1] + "}, 9]"	# Splits into maximum of 9 clusters

	Wres = str( FC(ret) ).strip()	# Wolfram result is thus; further modification needed for visualization
	return parse(Wres)

##################
##
##  Secondary interface function:
##	Takes the same JSON as IFace, but returns a tab-delimited string containing values for axes.
##
def Fields(jstr):
	parsed = json.loads(jstr)

	q = [""] * 3

	for idx, e in enumerate(parsed[0]):
		q[idx] = str(e)
	#return q[0] + '\t' + q[1] + '\t' + q[2]
	return [q[0], q[1], q[2]]

#########
##
## Iterate through string result
# (Recursively?) put values into lists
	
# Characters to encounter:
#	{ } ( ) | - ,
#	0-9

# 3D List:	list[m][n][p]
#	p ranges 0-2 for x,y,z
#	n ranges for total points in one cluster
#	m ranges for total clusters
##
def parse(Res):
	# This needs to be modified so Sergei can recieve it properly
	# Looks like
	#		Integer:
	# {(1 | -8 | 2 2 | 4 | 1 5 | 1 | 8), (100 | -10 | 1 50 | 20 | 3 60 | 0 | 13), (3 | 2 | 31 0 | 3 | 250)}
	# 
	# 		Float:
	#	({266257., 16., 69.} | {266259., 15., 69.})
	#
	# Array of arrays would be
	#
	#[  [ [1,-8,2],[2,4,1],[5,1,8] ], [ [100,-10,1],[50,20,3],[60,0,13] ], [ [3,2,31],[0,3,250] ]  ]
	#		[ [[],[],[]],[[],[],[]],[[],[]] ]
	#

	c1 = 0 	# String counters
	c2 = 1

	buf = [0] 	#Temporary holding value
	neg = 1		# counter for negative numbers

	pipe = 0 	# count for how many pipes have been passed (after two there will be a possible new point)
		# This happens to count 0-2 for items in row

	n = 0 		# number of rows in one matrix
	m = 0 		# number of distinct matrices in result
	lst = [[[]]]

	counter = 0
	check = False
	if(Res[0] == '{'):
		#Replacements:
		while (Res[c1] != '\0'):
			if(Res[c1] == '{'):
				Res = stri[:c1] + "(" + stri[c1:]
			elif(Res[c1] == '}'):
				Res = stri[:c1] + ")" + stri[c1:]
			elif(Res[c1] == ')'):
				Res = stri[:c1] + "}" + stri[c1:]
			elif(Res[c1] == '('):
				Res = stri[:c1] + "{" + stri[c1:]
			elif(Res[c1] == '|'):
				Res = stri[:c1] + "," + stri[c1:]
				counter = counter + 1
			elif(Res[c1] == ','):
				Res = stri[:c1] + "|" + stri[c1:]
			elif(Res[c1] == ' ' and check==False and counter==2):
				check = True
			elif(Res[c1] == ' ' and check):
				check = False
				Res = stri[:c1] + "}, {" + stri[c1:]
			c1 = c1 + 1


# {} is only applicable for sets with all integers
# DOES NOT WORK
	if(Res[0] == '{'):
		while( Res[c1] != '}' ):
			if(Res[c1] == '{'):
				c2 = c2
			elif(Res[c1] == '('):
				#m = m + 1
				c2 = c2
			elif(Res[c1] == ')'):
				c1 = c1 + 1
			elif(Res[c1] == '|'):
				pipe = pipe + 1
			elif(Res[c1] == ' '):
				c2 = c2
			elif(Res[c1] == ','):
				c2 = c2
			elif(Res[c1] == '.'):
				buf.append('.')
			elif(Res[c1] == '-'):
				neg = -1
			else:
				buf.append(int( Res[c1] ))		# must be a number

				if( Res[c1+1]=='}' or
					Res[c1+1]=='{' or
					Res[c1+1]=='(' or
					Res[c1+1] == ')' or
					Res[c1+1] == '|' or
					Res[c1+1]==' ' or
					Res[c1+1]==',' or
					Res[c1+1]=='-' ):
					sum = ""
					for c in buf:
						sum = sum + str(c)
					#list[m][n][pipe] = float(sum) * neg
					lst[m][n].append( float(sum)*neg )

					print("M=%d n=%d pipe=%d "%(m,n,pipe))
					print lst

					sum = ""
					buf = [0]
					neg = 1

					if(pipe == 2):
						pipe = 0
						if(Res[c1+1:].strip()[0]):
							n = 0
							m = m + 1
						else:
							n + 1
				else: # . or digit
					#buf.append(Wres[c1+1])
					c2 = c2

			c1 = c1 + 1
			c2 = c2 + 1

			#print "M=%d n=%d pipe=%d "%(m,n,pipe)
			#print lst

		return lst

# Applicable for sets with floats
# DOES WORK - always reorder data sets to have floats
	elif(Res[0] == '('):
		c1 = 0
		while( Res[c1] != ')' ):
			if(Res[c1] == '('):
				c2 = c2
			elif(Res[c1] == '{'):
				c2 = c2
			elif(Res[c1] == '}'):
				c2 = c2
			elif(Res[c1] == ','):
				pipe = pipe + 1
			elif(Res[c1] == ' '):
				c2 = c2
			elif(Res[c1] == '|'):
				c2 = c2
			elif(Res[c1] == '-'):
				neg = -1
			else:	# [0-9] or \.
				if(Res[c1] == '.'):
					buf.append('.')
				else:
					#print "have a number %d at c1=%d"%(int(Res[c1]), c1)
					buf.append(int( Res[c1] ))		# must be a number

				if( Res[c1+1]=='}' or
					Res[c1+1]=='{' or
					Res[c1+1]=='(' or
					Res[c1+1] == ')' or
					Res[c1+1] == '|' or
					Res[c1+1]==' ' or
					Res[c1+1]==',' or
					Res[c1+1]=='-' ):
					sum = ""
					for c in buf:
						sum = sum + str(c)
					#list[m][n][pipe] = float(sum) * neg
					lst[m][n].append( float(sum)*neg )		# Append axes one by one: make sure to append points, clusters

					#print("M=%d n=%d pipe=%d "%(m,n,pipe))
					#print lst

					sum = ""
					buf = [0]
					neg = 1

					if(pipe == 2):
						pipe = 0
						if(Res[c1+1:].strip()[0] == ','):
							n + 1
							lst[m].append([])
						elif(Res[c1+1:].strip()[0] == ')'):
							c2 = c2
						else:
							n = 0
							m = m + 1
							lst.append([[]])
							
				else: # . or digit
					#buf.append(Wres[c1+1])
					c2 = c2

			c1 = c1 + 1
			c2 = c2 + 1

			#print "\nM=%d n=%d pipe=%d "%(m,n,pipe)
			#print lst

		lst.pop(m)
		return lst

if __name__ == "__main__":
	main()
