//main.js

var MAX_ROUNDS = 6;
var globalScreenName = "";

var database = null;
var firebaseConfig = null;

var gameKey = null;
var allPlayersRef = null;
var addNewPlayer = true;
var currentGame = null;
var allGamesRef = null;
var isPlayerRefValid = false;
var dbListener = null;
var playersRef = null;
var games = {};
var gameProgressRef = null;
var gameProgressListener = null;
var roundTimerRunningRef = null;
var roundTimerListener = null;
var roundRef = null;
var roundRefListener = null;
var remoteRoundValue = 1;
var localPlayer = null;
var localPlayerRef = null;
var players = null;

function initializeForm(){

	console.log("in initializeForm");
	
	firebaseConfig = null;
	
	gameKey = null;
	allPlayersRef = null;
	addNewPlayer = true;
	currentGame = null;
	removeAllPlayers();
	setDefaultButton();
	initializeFirebase();
	allGamesRef = firebase.database().ref('games/');
	initializeGame();
	if (globalScreenName === null){
		$('#screenNameUnchosen').show();
		$('#screenNameChosen').hide();
		$("#screenNameText").focus();
		return;
	}

	displayScreenName(globalScreenName);
}

function initializeGame(){
	displayNotJoined();
	database = null;

	updateGlobalScreenName();

	database = firebase.database();
	console.log("Got database");
	initFBGamePath();
}

function updateGlobalScreenName(){
	globalScreenName = getScreenName();
}

function initFBGamePath(){
	isPlayerRefValid = false;
	allGamesRef.once('value', function(snapshot) {
		// If there is no game created...
		if (snapshot.val() === null){
			createNewGame(snapshot);
		}
		else{
			// ...otherwise there is a game created and it may have players.
			loadPlayers(snapshot);
		}
	});
}

function createNewGame(snapshot){
	
	console.log("no games here");
	// get key for new game
	gameKey = allGamesRef.push().key;
	console.log(gameKey);

	currentGame = new Game();
	updateFbGames();
}

function updateFbGames(){
	games['/games/' + gameKey] = currentGame;
	database.ref().update(games);
}

function watchGameProgress(){
	gameProgressRef = database.ref('games/' + gameKey + '/inProgress/');
	gameProgressListener = gameProgressRef.on('value', handleGameProgressChange);
}

function handleGameProgressChange(snapshot){
	if (snapshot.val() !== null){
		var inProgress = snapshot.val();
		console.log(inProgress);
		if (inProgress){
			disableButton("#button-startGame");
			watchRound();
			watchRoundTimer();
		}
		else{
			// Game OVER!!! (not running)
			hideButton("#nextRound");
			enableButton("#button-startGame");
			console.log("no longer watching round timer.");
			stopWatchingRoundTimer();
			if (roundRef !== null){
				roundRef.off('value',roundRefListener);
			}
			if (players != null){
				for (var pcount = 0; pcount < players.length; pcount++){
					console.log(players[pcount].screenName  + " : " + players[pcount].score);
				}
			}
		}
	}
}

function watchRound(){
	roundRef = database.ref('games/' + gameKey + '/round/');
	roundRefListener = roundRef.on('value', handleRoundChange);
}

function handleRoundChange(snapshot){
	if (snapshot.val() !== null){
		remoteRoundValue = snapshot.val();
		$("#button-vote").text("Round " + remoteRoundValue);
	}
}


function vote(){
	$("#button-vote").text("clicked!");
	localPlayer.score += 1;
	updatePlayerScore();
}

// ################### SETUP TIMER ##########################
// Set the date we're counting down to
var futureTime = null; // Number(new Date()) + 5000;
var countDownDate = null; // new Date(futureTime);
var intervalHandle = null;

function startCountdown(){
	showButton("#countdown");
	hideButton("#nextRound");
	futureTime = Number(new Date()) + 5500;
	countdownDate = new Date(Number(futureTime));
	if (intervalHandle !== null){
		clearInterval(intervalHandle);
	}
	intervalHandle = setInterval (updateTimer, 200);
}

function updateTimer(){

  var distance = (Number(new Date()) - futureTime) / 1000;

  $("#countdown").text("You have " + Math.abs(distance) + " to press the Round " + remoteRoundValue +" button");

  // If the count down is over, write some text 
  if (distance > 0) {
	clearInterval(intervalHandle);
	intervalHandle = null;
    hideButton("#countdown");
	showButton("#nextRound");
	roundTimerRunningRef.set(false);
	if (roundCounter < MAX_ROUNDS){
		roundCounter++;
		roundRef.set(roundCounter);
		$("#button-vote").text("Round " + roundCounter);
	}
  }
}

// ##########################################################

function watchRoundTimer(){
	console.log("in watchRoundTimer...");
	roundTimerRunningRef = database.ref('games/' + gameKey + '/isRoundTimerRunning/');
	roundTimerListener = roundTimerRunningRef.on('value', handleRoundTimer);
}

function stopWatchingRoundTimer(){
	if (roundTimerRunningRef !== null && roundTimerRunningRef !== undefined){
		roundTimerRunningRef.off('value',roundTimerListener);
	}
}

function handleRoundTimer(snapshot){
	if (snapshot.val() !== null){
		var isRoundTimerRunning = snapshot.val();
		console.log("isRoundTimerRunning : " + isRoundTimerRunning);
		if (isRoundTimerRunning){
			console.log("show the round timer button!");
			showButton("#button-vote");
			startCountdown();
		}
		else{
			console.log("hide the round timer button!");
			hideButton("#button-vote");
		}
	}
}

function joinGame(){
	if (globalScreenName === null || globalScreenName === undefined || globalScreenName === ""){
		alert("You cannot join a game until you've created a Screen Name.");
		$("#screenNameText").focus();
		return;
	}
	displayJoinedGame();
	enableButton("#button-startGame");
	checkForAddPlayer();
	if (addNewPlayer){
		writePlayerToDB();
	}
	setupPlayerRef();
	watchGameProgress();
}

function displayJoinedGame(){
	var msg = globalScreenName + " has joined the game.";
	$('#joined').text(msg);
	$("#notJoined").hide();
	$("#joined").show();
}

function displayNotJoined(){
	$("#joined").hide();
	$("#notJoined").show();
}

function enableButton(buttonSelector){
	$(buttonSelector).addClass("enabled");
	$(buttonSelector).removeClass("disabled");
}

function disableButton(buttonSelector){
	$(buttonSelector).addClass("disabled");
	$(buttonSelector).removeClass("enabled");
}

function hideButton(buttonSelector){
	$(buttonSelector).addClass("d-none");
}

function showButton(buttonSelector){
	$(buttonSelector).removeClass("d-none");
}


function checkForAddPlayer(){
	for (let x = 0; x < currentGame.allPlayers.length;x++){
		if (currentGame.allPlayers[x].screenName == globalScreenName){
			addNewPlayer = false;
			return;
		}
	}
}

function writePlayerToDB(){
	console.log("writePLayerToDB()");
	var p = new Player(globalScreenName);
	console.log("p");
	console.log(p);

	currentGame.allPlayers.push(p);

	//updateFbGames();
	updatePlayers(p);
	console.log(currentGame);
	console.log("database.ref().update(games)");
	
	addNewPlayer = false;
}

function updatePlayers(player){
	
	if (localPlayer === null){
		console.log("### localPlayer is valid! ###");
		localPlayer = player;
	}
	
	if (allPlayersRef === null){
		setupPlayerRef();
	}
	allPlayersRef.push(player);
}

function updatePlayerScore(){
	console.log(localPlayer);
	localPlayerRef.set(localPlayer);
}

function loadPlayers(snapshot){
	snapshot.forEach(function(playersSnapshot) {
		gameKey = playersSnapshot.key;
		console.log("playersSnapshot.val()")
		console.log(playersSnapshot.val());
		
		var playersCollection = playersSnapshot.val();
		console.log(playersCollection.allPlayers);
		for(let key in playersCollection.allPlayers){
			console.log("key : " + key);
			console.log(playersCollection.allPlayers[key]["screenName"]);
		}
		console.log(gameKey);
		console.log(playersCollection);
		
		if (currentGame === null){
			currentGame = new Game();
		}
		if (playersCollection !== undefined){
			for(let key in playersCollection.allPlayers){
				if (playersCollection.allPlayers[key]["screenName"] == globalScreenName){
					localPlayerRef = firebase.database().ref('games/' + gameKey + '/allPlayers/' + key);
					addNewPlayer = false;
				}
				console.log("player");
				console.log(playersCollection.allPlayers[key]);
				currentGame.allPlayers.push(new Player(playersCollection.allPlayers[key]["screenName"]));
			}
		}
		else{
			// there are no player refs
			//setupPlayerRef();
			currentGame = new Game();

			if (allPlayersRef !== null){
				allPlayersRef.off("child_added", dbListener);
			}
			isPlayerRefValid = false;
			addNewPlayer = true;
		}
	});
}

function setupPlayerRef(){
	if (!isPlayerRefValid){
		playersRef = 'games/' + gameKey +  "/allPlayers/";
		console.log("playersRef : " + playersRef);
		allPlayersRef = firebase.database().ref(playersRef);
		dbListener = allPlayersRef.on('value', handlePlayerRefresh);
		isPlayerRefValid = true;
	}
}

function handlePlayerRefresh(clipshot) {
	console.log("handlePlayerRefresh");
	$("#playerList").empty();
	currentGame.allPlayers = [];

	if (clipshot.val() !== null){
		console.log("running");
		console.log(clipshot.val());
		
		players = clipshot.val();
		for (let key in players){
			console.log("players key : "+ key);
			console.log(players[key]["screenName"]);
			if (players[key]["screenName"] == globalScreenName){
				localPlayerRef = firebase.database().ref('games/' + gameKey + '/allPlayers/' + key);
				localPlayer = players[key];
				console.log(" localPlayer ----> " );
				console.log(localPlayer);
			}
			var o = new Option(players[key]["screenName"], players[key]["screenName"]);
			/// jquerify the DOM object 'o' so we can use the html method
			$(o).html(players[key]["screenName"]);
			$("#playerList").append(o);
			currentGame.allPlayers.push(new Player(players[key]["screenName"]));
		}
	}
	else{
		console.log("clipshot is null! - There are NO PLAYERS!");
		addNewPlayer = true;
		displayNotJoined();
	} 
}

var roundCounter = 1;
var completeGameInterval = null;

function runCompleteGame(){
	roundCounter = 1;
	roundTimerRunningRef.set(true);
	completeGameInterval = setTimeout(runRound,500);
}

function runRound(){
	if (roundCounter < MAX_ROUNDS){
		//roundCounter++;
		//roundRef.set(roundCounter);
		$("#button-vote").text("Round " + roundCounter);
		watchGameProgress();
		roundTimerRunningRef.set(true);
		completeGameInterval = setTimeout(runRound,10000);

	}
	else{
		gameProgressRef.set(false);
	}
}

function startGame(){
	currentGame.inProgress = true;
	gameProgressRef.off('value',gameProgressListener);
	updateFbGames();
	gameProgressRef.on('value',gameProgressListener);
	runCompleteGame();
}

function deleteGame(){
	allGamesRef.remove();
	displayNotJoined();
}

function displayScreenName(screenName){
	var msg = "Your Screen Name is saved as : " + screenName;
	$('#screenNameUnchosen').alert('close');
	$('#screenNameChosen').text(msg);
	$('#screenNameChosen').show();
}

function setScreenName(){
	if ($("#screenNameText").val() == ""){
		alert("Please enter a valid Screen Name and try again.");
		$("#screenNameText").focus();
		return;
	}
	var screenName = $("#screenNameText").val();
		
	displayScreenName(screenName);
	$('#screenNameText').val("");
	$("#screenNameText").focus();
	writeScreeNameToStorage(screenName);
	updateGlobalScreenName();
	addNewPlayer = true;
	// #### test code #######################
	// alert(encodedVal);
	// alert(getDecodedValue(encodedVal));
	// ######################################
		
}

function writeScreeNameToStorage(screenName){
	var encodedScreenName = getEncodedValue(screenName);
	localStorage.setItem("screenName", encodedScreenName);
}

function getScreenName(){
	// when localStorage items does not exist then screenName will be null
	var screenName = localStorage.getItem("screenName");
	if (screenName !== null){
		screenName = getDecodedValue(screenName);
	}
	return screenName; // either a null or a valid value will be returned.
}

function getEncodedValue(clearText){
	return btoa(encodeURI(clearText));
}

function getDecodedValue(encodedValue){
	try {
		return decodeURI(atob(encodedValue));
	}
	catch (e){
		throw (e);
	}
}

function removeAllPlayers(){
	 $("#playerList").empty();
}

function setDefaultButton(){
	$("#screenNameText").keypress(function(event){
  if(event.keyCode == 13){
		event.preventDefault();
    $('#button-screenName').click();
  }
});
}

function initializeFirebase(){
	firebaseConfig = {
    apiKey: "AIzaSyCOxHx8_MFMH41jGkvJLxt6dksJpo3HrZA",
    authDomain: "dilemmapuzzle.firebaseapp.com",
    databaseURL: "https://dilemmapuzzle.firebaseio.com",
    projectId: "dilemmapuzzle",
    storageBucket: "dilemmapuzzle.appspot.com",
    messagingSenderId: "721138909987",
    appId: "1:721138909987:web:83babc149f824f44"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
}

function Game(){
	this.round = 1;
	this.allPlayers = [];
	this.inProgress = false;
	this.isRoundTimerRunning = false;
}

function Player(screenName){
	this.screenName = screenName;
	this.score = 0;
}