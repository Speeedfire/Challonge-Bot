var Discord = require('discord.js');
var challonge = require('challonge')
var request = require('request');

challonge.api_key = ""

function checkRole(message,rolename){
	var manager = true, 
		authorRoles, 
		roleNames;
	
	if(message.hasOwnProperty('member') && message.member.hasOwnProperty('roles')) {
		authorRoles = message.member.roles.array();
		roleNames = [];
		for (var i = authorRoles.length - 1; i >= 0; i--) {
			roleNames.push(authorRoles[i].name)
		}
		manager = roleNames.indexOf(rolename) != -1;
	}
    
    return manager;
}

var client = new Discord.Client();

var token = '';
client.login(token);

client.on('guildCreate', guild => {
	guild.createRole({
		name:"Tournament Manager",
		color:"#FF7324",
		mentionable: true
	})
	guild.createChannel("Tournament","text")
	finalMessage = ""
	finalMessage += "Thank your for adding Challonge Discord Bot to your server! \n"
	finalMessage += "To create a tournamnent you must have the Tournament Manager role I have created. This will allow you access to the moderator specific commands. \n"
	finalMessage += "I have also created a #tournament channel for this server's members to use my commands in. \n"
	finalMessage += "Type =help to view all of the commands \n"
	guild.defaultChannel.sendMessage(finalMessage)
});

client.on('message', message => {
	if(message.channel.name == "tournament"){
		var input = message.content.split(" ")
		if(input[0] == "=help" && input.length == 1){
			finalMessage = ""
			finalMessage += "__Dotabuddy.hu Event Maker (Made by Darkspine77)__ \n \n"
			finalMessage += "**=create** \n"
			finalMessage += "```"
			finalMessage += "Function: Creates a challonge tournament \n"
			finalMessage += "Usage: =create (Name) (Game) (Year-Month-Day-Hour-Minute) (Participant Amount) \n"
			finalMessage += "Example_1: =create EventName Dota2 2017-03-17-12-30 limit-16 \n"
			finalMessage += "Example_2: =create EventName Dota2 2017-03-17-12-30 free \n"
			finalMessage += "``` \n"
			finalMessage += "**=start** \n"
			finalMessage += "``` "
			finalMessage += "Function: Starts a challonge tournament \n"
			finalMessage += "Usage: =start (Tournament_Name) \n"
			finalMessage += "Example: =start EventName \n"
			finalMessage += "``` \n"
			finalMessage += "**=delete** \n"
			finalMessage += "``` "
			finalMessage += "Function: Deletes a challonge tournament \n"
			finalMessage += "Usage: =delete (Tournament_Name) \n"
			finalMessage += "Example: =delete EventName \n"
			finalMessage += "``` \n"
			finalMessage += "**=join** \n"
			finalMessage += "``` "
			finalMessage += "Function: Join a challonge tournament \n"
			finalMessage += "Usage: =join (Tournament_Name) \n"
			finalMessage += "Example: =join EventName \n"
			finalMessage += "``` \n"
			finalMessage += "**=leave** \n"
			finalMessage += "``` "
			finalMessage += "Function: Leave a challonge tournament \n"
			finalMessage += "Usage: =leave (Tournament_Name) \n"
			finalMessage += "Example: =leave EventName \n"
			finalMessage += "``` \n"
			finalMessage += "**=edit** \n"
			finalMessage += "``` "
			finalMessage += "Function: Edit tournament info \n"
			finalMessage += "Usage: =edit (Tournament_Name) (Attribute) (New Value)\n"
			finalMessage += "Example: =edit EventName name PokemonTournament! \n"
			finalMessage += "Attributes: name / game / date / limit \n"
			finalMessage += "``` \n"
			finalMessage += "**=info** \n"
			finalMessage += "``` "
			finalMessage += "Function: See tournament info \n"
			finalMessage += "Usage: =info (Tournament_Name) \n"
			finalMessage += "Example: =info EventName \n"
			finalMessage += "``` \n"
			finalMessage += "**=report** \n"
			finalMessage += "``` "
			finalMessage += "Function: Report match results \n"
			finalMessage += "Usage: =report (Tournament_Name) (Match Number) (Match Result) (Final Match?) \n"
			finalMessage += "Example_1: =report EventName 1 0-1 false\n"
			finalMessage += "Example_2: =report EventName 1 0-2 true\n"
			finalMessage += "``` \n"
			finalMessage += "**=match** \n"
			finalMessage += "``` "
			finalMessage += "Function: See match status \n"
			finalMessage += "Usage_1: =match (Tournament_Name) *Will show match of command invoker* \n"
			finalMessage += "Usage_2: =match (Tournament_Name) (Match Number) \n"
			finalMessage += "Example_1: =match EventName \n"
			finalMessage += "Example_2: =match EventName 1 \n"
			finalMessage += "``` \n"
			message.channel.sendMessage(finalMessage)
		}

		if(input[0] == "=create" && input.length == 5 && checkRole(message,"Tournament Manager")){
			challonge.createTournament(input[1],input[2],input[3],input[4],function(tournament){
				message.channel.sendMessage(input[1] + " was created!")
				message.guild.createRole({
					name:"Participant - " + tournament.name,
					color:"#FF7324",
					mentionable: true
				})
				message.guild.createRole({
					name:"Owner - " + tournament.name,
					color:"#FF7324",
					mentionable: true
				}).then(role => message.member.addRole(role))
				message.delete()
			})
		}

		if(input[0] == "=start" && input.length == 2 && checkRole(message,"Owner - " + input[1]	)){
			challonge.getTournament(input[1],function(tournament){
				challonge.startTournament(tournament,function(){
					message.channel.sendMessage(input[1] + " was started! Brackets at http://challonge.com/users/dotabuddy")
					var guildroles = message.guild.roles.array()
					for (var i = guildroles.length - 1; i >= 0; i--) {
						if(guildroles[i].name == "Participant - " + tournament.name ){
							message.channel.sendMessage(guildroles[i].toString())
						}
					}
				})
			})
		}

		if(input[0] == "=delete" && input.length == 2 && checkRole(message,"Owner - " + input[1])){
			challonge.deleteTournament(input[1],function(tournament){
				message.channel.sendMessage(input[1] + " was deleted!")
				var guildroles = message.guild.roles.array()
					for (var i = guildroles.length - 1; i >= 0; i--) {
						if(guildroles[i].name == "Owner - " + tournament.name || guildroles[i].name == "Participant - " + tournament.name ){
							guildroles[i].delete();
						}
					}
				})
		}

		if(input[0] == "=edit" && input.length == 4 && checkRole(message,"Owner - " + input[1])){
			challonge.updateTournament(input[1],input[2],input[3],function(){
				message.channel.sendMessage(input[1] + " was edited!")
				if(input[2] == "name"){
					var guildroles = message.guild.roles.array()
						for (var i = guildroles.length - 1; i >= 0; i--) {
							if(guildroles[i].name == "Owner - " + input[1]){
								guildroles[i].setName("Owner - " + input[3]);
							}
							if(guildroles[i].name == "Participant - " + input[1]){
								guildroles[i].setName("Participant - " + input[3]);
							}
						}
				}
			})
		}

		if(input[0] == "=join" && input.length == 2){
			challonge.getTournament(input[1],function(tournament){
				challonge.listParticipants(tournament,function(participants){
					var participantList = []
					for (var i = participants.length - 1; i >= 0; i--) {
						participantList.push(participants[i].participant.name)
					}
					if(participantList.indexOf(message.author.username) != -1){
						message.channel.sendMessage(message.author.username + " You already registered!")
					} else {
						challonge.addPlayer(tournament,message.author.username,function(){
							message.channel.sendMessage(message.author.username + " Successfully registered to " + tournament.name + "!")
							var guildroles = message.guild.roles.array()
							for (var i = guildroles.length - 1; i >= 0; i--) {
								if(guildroles[i].name == "Participant - " + tournament.name){
									message.member.addRole(guildroles[i])
								}
							}
						})
					}
				})
			})
		}

		if(input[0] == "=leave" && input.length == 2){
			challonge.getTournament(input[1],function(tournament){
				challonge.listParticipants(tournament,function(participants){
					var participantList = []
					for (var i = participants.length - 1; i >= 0; i--) {
						participantList.push(participants[i].participant.name)
					}
					if(participantList.indexOf(message.author.username) == -1){
						message.channel.sendMessage(message.author.username + " Not registered!")
					} else {
						challonge.removePlayer(tournament,message.author.username,function(){
							message.channel.sendMessage(message.author.username + " Deleted " + tournament.name + "!")
							var guildroles = message.member.roles.array()
							for (var i = guildroles.length - 1; i >= 0; i--) {
								if(guildroles[i].name == "Participant - " + tournament.name){
									message.member.removeRole(guildroles[i])
								}
							}
						})
					}
				})
			})
		}
		if(input[0] == "=info" && input.length == 2){
				challonge.getTournament(input[1],function(tournament){
					finalMessage = ""
					finalMessage += "**" + tournament.name + "** \n"
					finalMessage += "```"
					var dateCreated = new Date(tournament.created_at) 
					finalMessage += "Created: " + dateCreated.toLocaleString() + " \n" 
					finalMessage += "Max Participants: " + tournament.signup_cap + " \n"
					finalMessage += "Participants: " + tournament.participants_count + " \n"
					finalMessage += "Game: " + tournament.game_name + " \n"
					var dateStarted = new Date(tournament.start_at) 
					finalMessage += "Start Time: " + dateStarted.toLocaleString() + " \n"
					finalMessage += "Status: " + tournament.state + " \n"
					finalMessage += "Completion: " + tournament.progress_meter + "% \n"
					finalMessage += "```"
					message.channel.sendMessage(finalMessage)
				})	
	}
		if(input[0] == "=report" && input.length == 5){
			challonge.getTournament(input[1],function(tournament){
				challonge.getMatch(tournament,input[2],function(match){
						challonge.getPlayerbyID(tournament,match.player1_id,function(player1){
								challonge.getPlayerbyID(tournament,match.player2_id,function(player2){
							if(message.author.username == player2.participant.name || message.author.username == player1.participant.name || checkRole("Owner - " + tournament.name)){
									challonge.updateMatch(tournament,input[2],input[3],input[4],function(){
									message.channel.sendMessage(message.author.username + " has updated the score of match " + match.suggested_play_order + "!")
									if(input[4] == "true"){
										challonge.getMatch(tournament,input[2],function(match){
											challonge.getPlayerbyID(tournament,match.winner_id,function(winner){
												message.channel.sendMessage(winner.participant.name + " has won match " + match.suggested_play_order + "!")
												challonge.getTournament(input[1],function(tournament){
													if(tournament.progress_meter == 100){				
														var members = message.guild.members.array()
														for (var i = members.length - 1; i >= 0; i--) {
															if(members[i].user.username == winner.participant.name){
																var member = members[i]
																message.guild.createRole({
																	name:"Winner - " + tournament.name,
																	color:"#FF7324",
																	mentionable: true
																}).then(role => member.addRole(role))	
																message.channel.sendMessage(winner.participant.name + " has won " + tournament.name + "!")
																/*
																challonge.deleteTournament(input[1],function(){
																	message.channel.sendMessage(winner.participant.name + " has won " + tournament.name + "!")
																	var guildroles = message.guild.roles.array()
																	for (var i = guildroles.length - 1; i >= 0; i--) {
																		if(guildroles[i].name == "Owner - " + tournament.name || guildroles[i].name == "Participant - " + tournament.name ){
																			guildroles[i].delete();
																		}
																	}
																})
																*/
															}
														}
													}
												})
											})
										})
									}
								})
							} else {
									message.channel.sendMessage("You can only update your own match scores!")
							}
						})
					})
				})
			})
		}
		if(input[0] == "=match"){
			if (input.length == 2) {
				challonge.getTournament(input[1],function(tournament){
					challonge.getMatchByPlayer(input[1],message.author.username,function(match){
						challonge.getPlayerbyID(tournament,match.player1_id,function(player1){
							challonge.getPlayerbyID(tournament,match.player2_id,function(player2){
								var finalMessage = "Match " + match.suggested_play_order + " is " + player1.participant.name + " vs " + player2.participant.name + "!"
								if(match.scores_csv != ""){									
									finalMessage += "\n"
									finalMessage += "The score is currently " + match.scores_csv + "."
								} else {
									finalMessage += "\n"
									finalMessage += "No scores have been reported."
								}
								message.channel.sendMessage(finalMessage)
							})
						})
					})
				})
			}
			if (input.length == 3) {
				challonge.getTournament(input[1],function(tournament){
					challonge.getMatch(tournament,input[2],function(match){
						challonge.getPlayerbyID(tournament,match.player1_id,function(player1){
							challonge.getPlayerbyID(tournament,match.player2_id,function(player2){
								var finalMessage = "Match " + match.suggested_play_order + " is " + player1.name + " vs " + player2.name + "!"
								if(match.scores_csv != ""){
									finalMessage += "\n"
									finalMessage += "The score is currently " + match.scores_csv + "."
								} else {
									finalMessage += "\n"
									finalMessage += "No scores have been reported."
								}
								message.channel.sendMessage(finalMessage)
							})
						})
					})
				})
			}
		}
	}
});

