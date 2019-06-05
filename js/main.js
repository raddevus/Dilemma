//main.js

function initializeForm(){
	$('#screenNameUnchosen').show();
	$('#screenNameChosen').hide();
	$("#screenNameText").focus();
}

function setScreenName(){
	if ($("#screenNameText").val() == ""){
		alert("Please enter a valid Screen Name and try again.");
		$("#screenNameText").focus();
	}
	var screenName = $("#screenNameText").val();
	//localStorage.setItem("screenName", $("#screenNameText").text());
	$('#screenNameUnchosen').alert('close');
	var msg = "Your Screen Name is saved as : " + $("#screenNameText").val();
	$('#screenNameChosen').text(msg);
	$('#screenNameChosen').show();
	$('#screenNameText').val("");
	$("#screenNameText").focus();
}

function getScreenName(){
	
}