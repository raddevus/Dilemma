//main.js

function initializeForm(){
	setDefaultButton();
	$('#screenNameUnchosen').show();
	$('#screenNameChosen').hide();
	$("#screenNameText").focus();
}

function setDefaultButton(){
	$("#screenNameText").keypress(function(event){
  if(event.keyCode == 13){
		event.preventDefault();
    $('#button-screenName').click();
  }
});
}

function setScreenName(){
	if ($("#screenNameText").val() == ""){
		alert("Please enter a valid Screen Name and try again.");
		$("#screenNameText").focus();
		return;
	}
	var screenName = $("#screenNameText").val();
	//localStorage.setItem("screenName", screenName);
	$('#screenNameUnchosen').alert('close');
	var msg = "Your Screen Name is saved as : " + $("#screenNameText").val();
	$('#screenNameChosen').text(msg);
	$('#screenNameChosen').show();
	$('#screenNameText').val("");
	$("#screenNameText").focus();
	
}

function getScreenName(){
	
}