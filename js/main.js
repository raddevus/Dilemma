//main.js
var localScreenName = "";

var database = null;
var firebaseConfig = null;

var gameKey = null;
var allPlayers = null;
var addNewPlayer = true;
var databaseExists = false;
var currentGame = null;
var allGames = null; 
var isPlayerRefValid = false;
var dbListener = null;
var playersRef = null;

function initializeForm(){

	console.log("in initializeForm");
	
	firebaseConfig = null;
	
	gameKey = null;
	allPlayers = null;
	addNewPlayer = true;
	databaseExists = false;
	currentGame = null;
	removeAllPlayers();
	setDefaultButton();
	initializeFirebase();
	allGames = firebase.database().ref('games/');
	initializeGame();
	if (localScreenName === null){
		$('#screenNameUnchosen').show();
		$('#screenNameChosen').hide();
		$("#screenNameText").focus();
		return;
	}

	displayScreenName(localScreenName);
	
}

function displayNotJoined(){
	$("#joined").hide();
	$("#notJoined").show();

}

function initializeGame(){
	displayNotJoined();
	database = null;

	resetScreenName();

	database = firebase.database();
	console.log("Got database");
	initFBGamePath();
}

function resetScreenName(){
	localScreenName = getScreenName();
}

function initFBGamePath(){
	isPlayerRefValid = false;
	allGames.once('value', function(snapshot) {
		// If there is no game created...
		if (snapshot.val() === null){
			createNewGame(snapshot);
		}
		else{
			// ...otherwise there is a game created and it may have players.
			loadPlayers(snapshot);
		}
	});//.then(setupPlayerRef);
}

function createNewGame(snapshot){
	
	console.log("no games here");
	// get key for new game
	gameKey = allGames.push().key;
	console.log(gameKey);
	var games = {};
	currentGame = new Game();
	games['/games/' + gameKey] = currentGame;
	database.ref().update(games);
}

function joinGame(){
	if (localScreenName === null || localScreenName === undefined || localScreenName === ""){
		alert("You cannot join a game until you've created a Screen Name.");
		$("#screenNameText").focus();
		return;
	}
	var msg = localScreenName + " has joined the game.";
	$('#joined').text(msg);
	$("#notJoined").hide();
	$("#joined").show();
	if (addNewPlayer){
		writePlayerToDB();
	}
	setupPlayerRef();
}

function writePlayerToDB(){
	var p = new Player(localScreenName);
	console.log("p");
	console.log(p);

	currentGame.allPlayers.push(p);

	var games = {};
	games['/games/' + gameKey] = currentGame;
	console.log(currentGame);
	console.log("database.ref().update(games)");
	database.ref().update(games);
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
				if (player.screenName == localScreenName){
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
		//initFBGamePath();
			if (allPlayers !== null){
				allPlayers.off("child_added", dbListener);
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
		allPlayers = firebase.database().ref(playersRef);
		dbListener = allPlayers.on('value', handlePlayerRefresh);
		isPlayerRefValid = true;
	}
}

function handlePlayerRefresh(clipshot) {
	console.log("handlePlayerRefresh");
	$("#playerList").empty();
	currentGame.allPlayers = [];
	/*allGames.once('value', function(snapshot) {
		loadPlayers(snapshot);
	});*/
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

function deleteGame(){
	allGames.remove();
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
	resetScreenName();
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