# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options 
from bs4 import BeautifulSoup
from bs4 import Comment
import pandas as pd
import time
import csv
import os
import sys
import random
import glob as gl
import requests

#----------------------------------------------------------------------


def MainTableScrape():
	# Output file
	
	outputfile = open('UCL_201920_club_sites.csv', 'wb')
	csv_writer = csv.writer(outputfile)
	csv_writer.writerow(["Group", "Club", "Website", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"])
	
	
	# Make URL
	finalURL = 'https://www.whoscored.com/Regions/250/Tournaments/12/Europe-UEFA-Champions-League' #baseURL + Teams[team] + '/Show/' #+ eplTeamsString[team] #archive
	print finalURL
	
	# Connect webdriver
	browser =  webdriver.Chrome("/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/chromedriver")
	#browser.add_argument('headless')
	#browser.set_window_size(1920, 1080) # PhantomJS default to 400X300 is executable element outside might cause problem
	browser.get(finalURL)
	time.sleep(2)
	
	content = browser.page_source
	soup = BeautifulSoup(''.join(content), 'lxml')
	


	for i in range(8):
		group = i + 17937
		#print 'standings-'+str(group)
		groupstring  = 'ABCFEDGH'
		UCLGroup = "Group "+groupstring[i]
		print UCLGroup
		
		table = soup.find("div", {"id": 'standings-'+str(group)}).find("tbody", {"id": 'standings-'+str(group)+'-content'})
		#standings-17938
		#standings-17944
		
		TeamName = []
		TeamHref = []
		
		for i in table:
			rows = i.findAll("td")
			TeamName = rows[1].get_text()
			for link in rows[1].findAll("a"):
				TeamHref = link.get("href")
			#csv_writer.writerow([UCLGroup, TeamName,TeamHref])
			print TeamName
			print TeamHref
			P = rows[2].get_text()
			W = rows[3].get_text()
			D = rows[4].get_text()
			L = rows[5].get_text()
			GF = rows[6].get_text()
			GA = rows[7].get_text()
			GD = rows[8].get_text()
			Pts = rows[9].get_text()
			csv_writer.writerow([UCLGroup, TeamName, TeamHref, P, W, D, L, GF, GA, GD, Pts])
	browser.quit()


def fbrefScrape():

	browser =  webdriver.Chrome("/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/chromedriver")

	TeamName = []
	TeamHref = []
	
	#Open team names and href keys from csv
	with open('UCL_201920_club_sites.csv') as csvDataFile:
		csvReader = csv.reader(csvDataFile)
		next(csvDataFile)
		for row in csvReader:
			TeamName.append(row[1])
			TeamHref.append(row[11])
	
	#Loop through teams in this seasons Champions League
	for team in range(len(TeamName)):
		print 'Writing stats for '+TeamName[team]
		#Write website url to scrape from.
		page = "https://fbref.com/en/squads/"+TeamHref[team]+"/2019-2020/s2900/"

		browser.get(page)

		time.sleep(5)

		content = browser.page_source
		pageSoup = BeautifulSoup(''.join(content), 'lxml')

		#pageTree = requests.get(page, headers=headers)
		#pageSoup = BeautifulSoup(pageTree.text.replace('<!--', '').replace('-->', ''), 'html.parser')

		#Find first table - standard "stats"
		table = pageSoup.find("table", {"id": "stats_standard_2900"})
		#Get Player Name
		PlayerName = []
		PlayerNationality = []
		#Find all players in standard table
		name = table.find_all("th", {"data-stat": "player"})
		#Extract names
		for i in name:
			if i.contents[0] == 'Player':
				continue
			else:
				try:
					PlayerName.append(i.contents[0].text)
				except:
					PlayerName.append(i.contents[0])
		
		#Get Player Nationality
		Nationality = table.find_all("td", {"data-stat": "nationality"})
		for i in Nationality:
			try:
				Nat = i.contents[0].text.split(" ")
				PlayerNationality.append(Nat[1])
			except:
				PlayerNationality.append(' ')

		#Extract other stats from standard table
		position = table.find_all("td", {"data-stat": "position"})
		Age = table.find_all("td", {"data-stat": "age"})
		MP = table.find_all("td", {"data-stat": "games"})
		Starts = table.find_all("td", {"data-stat": "games_starts"})
		Min = table.find_all("td", {"data-stat": "minutes"})
		Gls = table.find_all("td", {"data-stat": "goals"})
		Ast = table.find_all("td", {"data-stat": "assists"})
		PK = table.find_all("td", {"data-stat": "pens_made"})
		PKatt = table.find_all("td", {"data-stat": "pens_att"})
		CrdY = table.find_all("td", {"data-stat": "cards_yellow"})
		CrdR = table.find_all("td", {"data-stat": "cards_red"})
		xG = table.find_all("td", {"data-stat": "xg"})
		npxG = table.find_all("td", {"data-stat": "npxg"})
		xA = table.find_all("td", {"data-stat": "xa"})
		
		#Create dictionary of stats
		PlayerDic = {}
		for i in range(len(PlayerName)):
			if PlayerName[i] == 'Squad Total':
				continue		
			else:
				PlayerDic[PlayerName[i]] = {"PlayerName":PlayerName[i],
										"Team": TeamName[team],
				 						"PlayerNat": PlayerNationality[i],
				 						"PlayerPos":position[i].text, 
				 						"PlayerAge": Age[i].text,
				 						"MatchesPlayed":MP[i].text,
				 						"Starts": Starts[i].text,
				 						"Minutes": Min[i].text,
				 						"Goals": Gls[i].text,
				 						"Assists": Ast[i].text,
				 						"PKScored": PK[i].text,
				 						"PKAttempts": PKatt[i].text,
				 						"YellowCards": CrdY[i].text,
				 						"RedCards": CrdY[i].text,
				 						"xG": xG[i].text,
				 						"NPxG": npxG[i].text,
				 						"xA": xA[i].text
				 						}

		#Do the same again, but this time for shooting stats table.
		PlayerName_shooting = []
		tableshooting  = pageSoup.find("table", {"id": "stats_shooting_2900"})

		nameshooting = tableshooting.find_all("th", {"data-stat": "player"})
		
		for i in nameshooting:
			if i.contents[0] == 'Player':
				continue
			else:
				try:
					PlayerName_shooting.append(i.contents[0].text)
					#print i.contents[0].text
				except:
					PlayerName_shooting.append(i.contents[0])
					#print i.contents[0]

		
		pens_made = tableshooting.find_all("td", {"data-stat": "pens_made"})
		Shots = tableshooting.find_all("td", {"data-stat": "shots_total"})
		Shots_on_target = tableshooting.find_all("td", {"data-stat": "shots_on_target"})
		Shots_from_FK = tableshooting.find_all("td", {"data-stat": "shots_free_kicks"})
		
		#Create shooting dictionary
		PlayerDic_Shooting = {}
		for i in range(len(PlayerName_shooting)):
			if PlayerName_shooting[i] == 'Squad Total':
				continue
			else:
				#PlayerKey = i
				PlayerDic_Shooting[PlayerName_shooting[i]] = {"pens_made":pens_made[i].text,
				 						"Shots": Shots[i].text,
				 						"Shots_on_target":Shots_on_target[i].text, 
				 						"Shots_from_FK": Shots_from_FK[i].text
				 						}
	 						
		PlayerName_passing = []
		tablepassing = pageSoup.find("table", {"id": "stats_passing_2900"})
		namepassing = tablepassing.find_all("th", {"data-stat": "player"})

		for i in namepassing:
			if i.contents[0] == 'Player':
				continue
			else:
				try:
					PlayerName_passing.append(i.contents[0].text)
				except:
					PlayerName_passing.append(i.contents[0])

		key_passes = tablepassing.find_all("td", {"data-stat": "assisted_shots"})
		passes_completed = tablepassing.find_all("td", {"data-stat": "passes_completed"})
		passes = tablepassing.find_all("td", {"data-stat": "passes"})
		passes_completed_short = tablepassing.find_all("td", {"data-stat": "passes_completed_short"})
		passes_short = tablepassing.find_all("td", {"data-stat": "passes_short"})
		passes_completed_medium = tablepassing.find_all("td", {"data-stat": "passes_completed_medium"})
		passes_medium = tablepassing.find_all("td", {"data-stat": "passes_medium"})
		passes_completed_long = tablepassing.find_all("td", {"data-stat": "passes_long"})
		passes_long = tablepassing.find_all("td", {"data-stat": "passes_long"})
		passes_left = tablepassing.find_all("td", {"data-stat": "passes_left_foot"})
		passes_right = tablepassing.find_all("td", {"data-stat": "passes_right_foot"})
		passes_fk = tablepassing.find_all("td", {"data-stat": "passes_free_kicks"})
		through_balls = tablepassing.find_all("td", {"data-stat": "through_balls"})
		passes_corner = tablepassing.find_all("td", {"data-stat": "corner_kicks"})
		throw_ins = tablepassing.find_all("td", {"data-stat": "throw_ins"})
		passes_final_third = tablepassing.find_all("td", {"data-stat": "passes_into_final_third"})
		passes_penalty_area = tablepassing.find_all("td", {"data-stat": "passes_into_penalty_area"})
		cross_penalty_area = tablepassing.find_all("td", {"data-stat": "crosses_into_penalty_area"})

		PlayerDic_Passing = {}
		for i in range(len(PlayerDic_Passing)):
			if PlayerName_passing[i] == 'Squad Total':
				continue
			else:
				#PlayerKey = i
				PlayerDic_Passing[PlayerName_passing[i]] = {"key_passes" : key_passes[i].text,
													 "passes_completed" : passes_completed[i].text,
													 "passes" : passes[i].text,
													 "passes_completed_short" : passes_completed_short[i].text,
													 "passes_short" : passes_short[i].text,
													 "passes_completed_medium" : passes_completed_medium[i].text,
													 "passes_medium" : passes_medium[i].text,
													 "passes_completed_long" : passes_completed_long[i].text,
													 "passes_long" : passes_long[i].text,
													 "passes_left" : passes_left[i].text,
													 "passes_right" : passes_right[i].text,
													 "passes_fk" : passes_fk[i].text,
													 "through_balls" : through_balls[i].text,
													 "passes_corner" : passes_corner[i].text,
													 "throw_ins" : throw_ins[i].text,
													 "passes_final_third" : passes_final_third[i].text,
													 "passes_penalty_area" : passes_penalty_area[i].text,
													 "cross_penalty_area" : cross_penalty_area[i].text}
		
		PlayerName_misc = []
		tablemisc = pageSoup.find("table", {"id": "stats_misc_2900"})
		namemisc = tablemisc.find_all("th", {"data-stat": "player"})

		for i in namemisc:
			if i.contents[0] == 'Player':
				continue
			else:
				try:
					PlayerName_misc.append(i.contents[0].text)
				except:
					PlayerName_misc.append(i.contents[0])

		fouls = tablemisc.find_all("td", {"data-stat": "fouls"})
		fouled = tablemisc.find_all("td", {"data-stat": "fouled"})
		offsides = tablemisc.find_all("td", {"data-stat": "offsides"})
		crosses = tablemisc.find_all("td", {"data-stat": "crosses"})
		tackles_won = tablemisc.find_all("td", {"data-stat": "tackles_won"})
		interceptions = tablemisc.find_all("td", {"data-stat": "interceptions"})
		pens_won = tablemisc.find_all("td", {"data-stat": "pens_won"})
		pens_conceded = tablemisc.find_all("td", {"data-stat": "pens_conceded"})
		own_goals = tablemisc.find_all("td", {"data-stat": "own_goals"})
		dribbles_completed = tablemisc.find_all("td", {"data-stat": "dribbles_completed"})
		dribbles = tablemisc.find_all("td", {"data-stat": "dribbles"})
		players_dribbled_past = tablemisc.find_all("td", {"data-stat": "players_dribbled_past"})
		nutmegs = tablemisc.find_all("td", {"data-stat": "nutmegs"})
		dribblers_tackled = tablemisc.find_all("td", {"data-stat": "dribble_tackles"})
		dribblers_tackles_attempted = tablemisc.find_all("td", {"data-stat": "dribbles_vs"})
		dribbled_past = tablemisc.find_all("td", {"data-stat": "dribbled_past"})

		PlayerDic_Misc = {}
		for i in range(len(PlayerName_misc)):
			if PlayerName_misc[i] == 'Squad Total':
				continue
			else:
				#PlayerKey = i
				PlayerDic_Misc[PlayerName_misc[i]] = {"fouls" : fouls[i].text,
													  "fouled" : fouled[i].text,
													  "offsides" : offsides[i].text,
													  "crosses" : crosses[i].text,
													  "tackles_won" : tackles_won[i].text,
													  "interceptions" : interceptions[i].text,
													  "pens_won" : pens_won[i].text,
													  "pens_conceded" : pens_conceded[i].text,
													  "own_goals" : own_goals[i].text,
													  "dribbles_completed" : dribbles_completed[i].text,
													  "dribbles" : dribbles[i].text,
													  "players_dribbled_past" : players_dribbled_past[i].text,
													  "nutmegs" : nutmegs[i].text,
													  "dribblers_tackled" : dribblers_tackled[i].text,
													  "dribblers_tackles_attempted" : dribblers_tackles_attempted[i].text,
													  "dribbled_past" : dribbled_past[i].text}
			
		Standard_df = pd.DataFrame.from_dict(data=PlayerDic, orient='index')
		Shooting_df = pd.DataFrame.from_dict(data=PlayerDic_Shooting, orient='index')
		Passing_df = pd.DataFrame.from_dict(data=PlayerDic_Passing, orient='index')	
		Misc_df = pd.DataFrame.from_dict(data=PlayerDic_Misc, orient='index')	

		df_col = pd.concat([Standard_df,Shooting_df, Passing_df, Misc_df], axis=1)
		
		if TeamName[team] == 'Paris Saint-Germain':
			df_col.to_csv("UCL_Stats_Full.csv", index = False, header=True, encoding = 'utf-8')
		else:
			df_col.to_csv("UCL_Stats_Full.csv", mode = 'a', index = False, header=False, encoding = 'utf-8')	


def testscrape():
	
	# Connect webdriver
	browser =  webdriver.Chrome("/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/chromedriver")
	#browser.add_argument('headless')
	#browser.set_window_size(1920, 1080) # PhantomJS default to 400X300 is executable element outside might cause problem
	finalURL = 'https://fbref.com/en/squads/e2d8892c/2019-2020/s2900/Paris-Saint-Germain'
	browser.get(finalURL)
	time.sleep(5)

	content = browser.page_source
	soup = BeautifulSoup(''.join(content), 'lxml')

	tableshooting  = soup.find("table", {"id": "stats_shooting_2900"})
	print tableshooting


	browser.quit()



def ClubScrape():
	
	TeamName = []
	TeamHref = []
	
	rownumber = 0
	
	with open('club_websites.csv') as csvDataFile:
		csvReader = csv.reader(csvDataFile)
		next(csvDataFile)
		for row in csvReader:
			TeamName.append(row[0])
			TeamHref.append(row[1])			
	
	baseURL = 'https://www.whoscored.com'
	
	count = 0
	
	# Each team
	for team in range(len(TeamName)):	
		if os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_club1/'+TeamName[team]+'_players.csv'):
			continue
		else:
			PlayerDictionary = {}
			finalURL = baseURL + TeamHref[team]
			print finalURL		
			club = TeamName[team]
			
			# Connect webdriver
			browser =  webdriver.Chrome("/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/chromedriver")
			#browser.add_argument('headless')
			#browser.set_window_size(1920, 1080) # PhantomJS default to 400X300 is executable element outside might cause problem
			browser.get(finalURL)
			time.sleep(random.randint(1,5))
			
			# Get content
			try:
				content = browser.page_source
				soup = BeautifulSoup(''.join(content), 'lxml')
				
				table = soup.find("div", {"id": "statistics-table-summary"}).find("tbody", {"id": "player-table-statistics-body"})
				
				players = table.findAll("tr")
				for i in players:
					count = count + 1
					playername = i.findAll("td")
					player =  playername[2].get_text()
					justtheplayername = player.split(',')
					PLAYER =  justtheplayername[0][:-3]
					AGE = justtheplayername[0][-3:]
					CLUB  = TeamName[team]
					attributes = i.findAll("a")
					for links in attributes:
						WEBSITE = links.get("href")
					PlayerDictionary[count] = {"PLAYER":PLAYER, "AGE":AGE, "CLUB":CLUB, "WEBSITE":WEBSITE}	     
				PlayerTable = pd.DataFrame.from_dict(data=PlayerDictionary, orient='index').to_csv("/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_club1/"+CLUB+"_players.csv", index = False, header=True, encoding = 'utf-8')  
			except: 
				time.sleep(60)
				content = browser.page_source
				soup = BeautifulSoup(''.join(content), 'lxml')
				
				table = soup.find("div", {"id": "statistics-table-summary"}).find("tbody", {"id": "player-table-statistics-body"})
				
				players = table.findAll("tr")
				for i in players:
					count = count + 1
					playername = i.findAll("td")
					player =  playername[2].get_text()
					justtheplayername = player.split(',')
					PLAYER =  justtheplayername[0][:-3]
					AGE = justtheplayername[0][-3:]
					CLUB  = TeamName[team]
					attributes = i.findAll("a")
					for links in attributes:
						WEBSITE = links.get("href")
					PlayerDictionary[count] = {"PLAYER":PLAYER, "AGE":AGE, "CLUB":CLUB, "WEBSITE":WEBSITE}	     
				PlayerTable = pd.DataFrame.from_dict(data=PlayerDictionary, orient='index').to_csv("/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_club1/"+CLUB+"_players.csv", index = False, header=True, encoding = 'utf-8')	
			else: 
				time.sleep(60)
				content = browser.page_source
				soup = BeautifulSoup(''.join(content), 'lxml')
				
				table = soup.find("div", {"id": "statistics-table-summary"}).find("tbody", {"id": "player-table-statistics-body"})
				
				players = table.findAll("tr")
				for i in players:
					count = count + 1
					playername = i.findAll("td")
					player =  playername[2].get_text()
					justtheplayername = player.split(',')
					PLAYER =  justtheplayername[0][:-3]
					AGE = justtheplayername[0][-3:]
					CLUB  = TeamName[team]
					attributes = i.findAll("a")
					for links in attributes:
						WEBSITE = links.get("href")
					PlayerDictionary[count] = {"PLAYER":PLAYER, "AGE":AGE, "CLUB":CLUB, "WEBSITE":WEBSITE}	     
				PlayerTable = pd.DataFrame.from_dict(data=PlayerDictionary, orient='index').to_csv("/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_club1/"+CLUB+"_players.csv", index = False, header=True, encoding = 'utf-8')	
			browser.quit()
			
		
	print 'Number of club files written: '	
	print str(len(os.listdir('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/club_files/')))
	print str(20-len(os.listdir('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/club_files/'))) + ' clubs remaining.' 
	

def PlayerScrape():
	
	Club = []
	PlayerAge = []
	PlayerName = []
	PlayerHref = []
	
	rownumber = 0
	for file in gl.glob('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/club_files/*.csv'):
		with open(file) as csvDataFile:
			csvReader = csv.reader(csvDataFile)
			next(csvDataFile)
			for row in csvReader:
				Club.append(row[0])
				PlayerName.append(row[1])
				PlayerAge.append(row[2])
				PlayerHref.append(row[3])
	
	baseURL = 'https://www.whoscored.com'
	
	count = 0
	
	# Each team
	for Player in range(len(PlayerName)):	
		if os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/'+PlayerName[Player]+'.csv'):
			print 'File already written for: ' + PlayerName[Player]	
		elif  os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/'+Club[Player].replace(' ', '')+'-'+PlayerName[Player].replace(' ', '')+".csv"):
			print 'File already written for: ' + PlayerName[Player]
		elif  os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/'+Club[Player]+'-'+PlayerName[Player].replace(' ', '')+".csv"):
			print 'File already written for: ' + PlayerName[Player]			
		else:
			PlayerDictionary = {}
			finalURL = baseURL + PlayerHref[Player].replace('Show', 'History')
			count = count + 1
			
			#print finalURL		
			#club = TeamName[team]
			# Connect webdriver
			browser =  webdriver.Chrome("/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/chromedriver")
			#browser.add_argument('headless')
			#browser.set_window_size(1920, 1080) # PhantomJS default to 400X300 is executable element outside might cause problem
			browser.get(finalURL)
			sleeptime = random.randint(1,5)
			print 'sleeping for: ' + str(sleeptime) + " seconds"
			time.sleep(sleeptime)
			print PlayerName[Player]
			
			try:
				content = browser.page_source
				soup = BeautifulSoup(''.join(content), 'lxml')
				
				table = soup.find("div", {"id": "statistics-table-summary"}).find("tbody", {"id": "player-table-statistics-body"})
				
				year_comp = table.findAll("tr")
				for i in year_comp:
					lines = i.findAll("td")
					count = count + 1
					Season = lines[0].get_text()
					Team = lines[1].get_text()
					Tournament = lines[2].get_text()
					Apps = lines[3].get_text()
					Mins = lines[4].get_text()
					Goals = lines[5].get_text()
					Assits = lines[6].get_text()
					YellowCards = lines[7].get_text()
					RedCards = lines[8].get_text()
					ShotsPerGame = lines[9].get_text()
					PassPercentage = lines[10].get_text()
					AerielsWon = lines[11].get_text()
					MotM = lines[12].get_text()
					WSRating = lines[13].get_text()
					PlayerDictionary[count] = {"Season": Season, "Team":Team, "Tournament": Tournament, "Apps":Apps, "Mins":Mins, "Goals":Goals, "Assits":Assits, "YellowCards":YellowCards, 
					                           "RedCards":RedCards, "ShotsPerGame":ShotsPerGame, "PassPercentage":PassPercentage, "AerielsWon": AerielsWon, "MotM": MotM, "WSRating":WSRating}
				HistoryTable = pd.DataFrame.from_dict(data=PlayerDictionary, orient='index').to_csv("/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/"+Club[Player].replace(' ', '')+'-'+PlayerName[Player].replace(' ', '')+".csv", index = False, header=True, encoding = 'utf-8')
			except:
				print "Scraped Failed. Sleeping for 30 seconds."
				time.sleep(30)
				content = browser.page_source
				soup = BeautifulSoup(''.join(content), 'lxml')
				
				table = soup.find("div", {"id": "statistics-table-summary"}).find("tbody", {"id": "player-table-statistics-body"})
				
				year_comp = table.findAll("tr")
				for i in year_comp:
					lines = i.findAll("td")
					count = count + 1
					Season = lines[0].get_text()
					Team = lines[1].get_text()
					Tournament = lines[2].get_text()
					Apps = lines[3].get_text()
					Mins = lines[4].get_text()
					Goals = lines[5].get_text()
					Assits = lines[6].get_text()
					YellowCards = lines[7].get_text()
					RedCards = lines[8].get_text()
					ShotsPerGame = lines[9].get_text()
					PassPercentage = lines[10].get_text()
					AerielsWon = lines[11].get_text()
					MotM = lines[12].get_text()
					WSRating = lines[13].get_text()
					PlayerDictionary[count] = {"Season": Season, "Team":Team, "Tournament": Tournament, "Apps":Apps, "Mins":Mins, "Goals":Goals, "Assits":Assits, "YellowCards":YellowCards, 
					                           "RedCards":RedCards, "ShotsPerGame":ShotsPerGame, "PassPercentage":PassPercentage, "AerielsWon": AerielsWon, "MotM": MotM, "WSRating":WSRating}
				HistoryTable = pd.DataFrame.from_dict(data=PlayerDictionary, orient='index').to_csv("/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/"+Club[Player].replace(' ', '')+'-'+PlayerName[Player].replace(' ', '')+".csv", index = False, header=True, encoding = 'utf-8')
			else:
				print "Scraped Failed. Sleeping for 30 seconds."
				time.sleep(30)
				content = browser.page_source
				soup = BeautifulSoup(''.join(content), 'lxml')
				
				table = soup.find("div", {"id": "statistics-table-summary"}).find("tbody", {"id": "player-table-statistics-body"})
				
				year_comp = table.findAll("tr")
				for i in year_comp:
					lines = i.findAll("td")
					count = count + 1
					Season = lines[0].get_text()
					Team = lines[1].get_text()
					Tournament = lines[2].get_text()
					Apps = lines[3].get_text()
					Mins = lines[4].get_text()
					Goals = lines[5].get_text()
					Assits = lines[6].get_text()
					YellowCards = lines[7].get_text()
					RedCards = lines[8].get_text()
					ShotsPerGame = lines[9].get_text()
					PassPercentage = lines[10].get_text()
					AerielsWon = lines[11].get_text()
					MotM = lines[12].get_text()
					WSRating = lines[13].get_text()
					PlayerDictionary[count] = {"Season": Season, "Team":Team, "Tournament": Tournament, "Apps":Apps, "Mins":Mins, "Goals":Goals, "Assits":Assits, "YellowCards":YellowCards, 
					                           "RedCards":RedCards, "ShotsPerGame":ShotsPerGame, "PassPercentage":PassPercentage, "AerielsWon": AerielsWon, "MotM": MotM, "WSRating":WSRating}
				HistoryTable = pd.DataFrame.from_dict(data=PlayerDictionary, orient='index').to_csv("/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/"+Club[Player].replace(' ', '')+'-'+PlayerName[Player].replace(' ', '')+".csv", index = False, header=True, encoding = 'utf-8')
			browser.quit()
			print 'Number of player files written: '	
			print str(len(os.listdir('/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/')))
			#print str(count-len(os.listdir('/Users/jakehughes/Documents/PythonScripts/FootballCode/bad_tottenham_player2/'))) + ' players remaining.' 			
		
	
def Filerename():

	Club = []
	PlayerAge = []
	PlayerName = []
	PlayerHref = []
	
	rownumber = 0
	for file in gl.glob('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/club_files/*.csv'):
		with open(file) as csvDataFile:
			csvReader = csv.reader(csvDataFile)
			next(csvDataFile)
			for row in csvReader:
				Club.append(row[0])
				PlayerName.append(row[1])
				PlayerAge.append(row[2])
				PlayerHref.append(row[3])
	
	baseURL = 'https://www.whoscored.com'
	
	count = 0
	print len(PlayerHref)
	
	
	# Each team
	for Player in range(len(PlayerName)):	
		if os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+PlayerName[Player]+'.csv'):
			continue
			#os.system('cp -R /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+PlayerName[Player].replace(' ', '\ ')+'.csv /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_history/'+PlayerName[Player].replace(' ', '')+'.csv')
			
		elif  os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+Club[Player].replace(' ', '')+'-'+PlayerName[Player].replace(' ', '')+".csv"):
			continue
			#os.system('cp -R /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+Club[Player].replace(' ', '')+'-'+PlayerName[Player].replace(' ', '')+'.csv /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_history/'+PlayerName[Player].replace(' ', '')+'.csv')

		elif  os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+Club[Player]+'-'+PlayerName[Player].replace(' ', '')+".csv"):
			continue
			#os.system('cp -R /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+Club[Player].replace(' ', '\ ')+'-'+PlayerName[Player].replace(' ', '')+'.csv /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_history/'+PlayerName[Player].replace(' ', '')+'.csv')			
			
		elif  os.path.exists('/Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+Club[Player]+'-'+PlayerName[Player].replace(' ', '')+".csv"):
			continue
			#os.system('cp -R /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_files/'+Club[Player]+'-'+PlayerName[Player].replace(' ', '')+'.csv /Users/jakehughes/Documents/PythonScripts/FootballCode/Bad_Tottenham/player_history/'+PlayerName[Player].replace(' ', '')+'.csv')
								
			
		else:
			print PlayerName[Player]
		
		



#MainTableScrape()

fbrefScrape()
#testscrape()

#ClubScrape()
#PlayerScrape()
#Filerename()


