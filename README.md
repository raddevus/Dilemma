
I have created a fully working prototype which doesn't implement all game rule logic yet, but does "work" : meaning it allows users to create a screen name, join a game and click the round button at the appropriate times.  I will add some screen shots here that step you thru using the app the first time.

If the user has never created a screen name then the game will look like this upon visiting the site.

<img src="https://files.slack.com/files-pri/TF8M27Y3G-FKPSPMS64/image.png" />

image.png

User will type a screen name and press <ENTER> or click the [Save] button.

image.png 

image.png

User's name is now displayed in upper left message indicating they successfully saved.  User hasn't joined a game so user doesn't have the list of others in the game.  (For now there is just one master game which all players will join).   Next, the user will click the [Join Game] button.

Player can now see a list of others and the scores for each player, from a previous game.

image.png 

image.png

For now, the scoring is simply adding to a counter each time the player clicks the [Round X] button (shown in screen shots below).

Any player can click the [Start Game] button (if no game is in progress, otherwise disabled).  When player clicks that button the game will start and the Round timer will begin and warn player counting down seconds until Round is over. (edited) 

image.png 

image.png

The [Round X] button also appears and player can click the button if player chooses.  For now that just increments the counter and updates everyone who is playing in real-time and the score will change on each player's screen.  Of course that score is not meaningful yet -- and in future may or may not be shown.

Then, between each round I provide a few seconds of wait time and alert the user that the next round will start in approx 5 seconds.

image.png 

image.png

Of course when the next round begins it updates the Round information (in countdown timer) and on button.

image.png 

image.png

The game continues for an arbitrarily chosen 5 rounds.    This is all the functionality (except for game rules implementation) that will make the game possible to play by any number of people on any type of device as long as they are connected to the Internet.

