//main.js
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
		}
		else{
			enableButton("#button-startGame");
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

function checkForAddPlayer(){
	for (let x = 0; x < currentGame.allPlayers.length;x++){
		if (currentGame.allPlayers[x].screenName == globalScreenName){
			addNewPlayer = false;
			return;
		}
	}
}

function writePlayerToDB(){
	var p = new Player(globalScreenName);
	console.log("p");
	console.log(p);

	currentGame.allPlayers.push(p);

	updateFbGames();
	console.log(currentGame);
	console.log("database.ref().update(games)");
	
	addNewPlayer = false;
}

function loadPlayers(snapshot){
	snapshot.forEach(function(playersSnapshot) {
		gameKey = playersSnapshot.key;
		var playersCollection = playersSnapshot.val();
		console.log(gameKey);
		console.log(playersCollection);
		if (currentGame === null){
			currentGame = new Game();
		}
		if (playersCollection.allPlayers !== undefined){
			playersCollection.allPlayers.forEach(function(player){
				console.log(player.screenName);
				if (player.screenName == globalScreenName){
					addNewPlayer = false;
				}
				console.log("player");
				console.log(player);
				currentGame.allPlayers.push(new Player(player.screenName));
			});
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
		clipshot.val().forEach( function (player){
			var o = new Option(player.screenName, player.screenName);
			/// jquerify the DOM object 'o' so we can use the html method
			$(o).html(player.screenName);
			$("#playerList").append(o);
			currentGame.allPlayers.push(new Player(player.screenName));
		});
	}
	else{
		console.log("clipshot is null! - There are NO PLAYERS!");
		addNewPlayer = true;
		displayNotJoined();
	} 
}

function startGame(){
	currentGame.inProgress = true;
	gameProgressRef.off('value',gameProgressListener);
	updateFbGames();
	watchGameProgress();
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
}

function Player(screenName){
	this.screenName = screenName;
	this.score = 0;
}