
## Game in dots 

https://eugenere95.github.io/game_in_dots/

### Functionality

Fetching game modes and leader board from server<br />
Updating server with game result<br />
Game instruction:<br />

- user set game difficulty and name
- press PLAY
- at a specified time interval (in the delay field) a random square on the field is highlighted in blue
- if the user managed to click on the square during this time - he turns green, the player gets a point and the field changes color to green
- if not, the field turns red and the point goes to the computer
- when a player or computer scores >50% of all possible cells in his color - he becomes the winner
- an inscription appears between the control buttons and the playing field that the player (the name he entered) / computer won
- button PLAY changes the caption to PLAY AGAIN

### Technologies used:

SCSS preprocessor, JavaScript, React js, axios, material-ui<br />
