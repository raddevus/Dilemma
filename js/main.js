//main.js

var localScreenName = "";
var game = {};
var database = null;
var firebaseConfig = null;

function initializeForm(){
	setDefaultButton();
	initializeFirebase();
	initializeGame();
	if (localScreenName === null){
		$('#screenNameUnchosen').show();
		$('#screenNameChosen').hide();
		$("#screenNameText").focus();
		return;
	}

	displayScreenName(localScreenName);
	
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

function initializeGame(){
	$("#joined").hide();
	$("#notJoined").show();
	var screenName = getScreenName();
	localScreenName = screenName;

	database = firebase.database();
	console.log("Got database");
	
	var currentGame = null;
	manageGames();
}

function setDefaultButton(){
	$("#screenNameText").keypress(function(event){
  if(event.keyCode == 13){
		event.preventDefault();
    $('#button-screenName').click();
  }
});
}

function manageGames(){
	if (localScreenName !== null){
		var allGames = firebase.database().ref('games/');
		allGames.once('value', function(snapshot) {
			if (snapshot.val() === null){
				console.log("no games here");
				// get key for new game
				var gameKey = allGames.push().key;
				console.log(gameKey);
				var games = {};
				currentGame = new Game();
				currentGame.allPlayers.push(new Player(localScreenName));
				
				games['/games/' + gameKey] = currentGame;
				database.ref().update(games);
				//firebase.database().ref('games/' + gameKey);
	
			}
			else{
				snapshot.forEach(function(childSnapshot) {
					var childKey = childSnapshot.key;
					var childData = childSnapshot.val();
					console.log(childKey);
					console.log(childData);
				});
			}
		
		});
	}
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
	initializeGame();
	localScreenName = screenName;
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