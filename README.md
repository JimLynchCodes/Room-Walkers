# Room Walkers
Simple JavaScript 2D Top-Down MMO with Phaser &amp; Websockets

## Backstory
This is the second example in my NodeJs Websockets Online Multiplayer Game series. You can find the first example [here](https://github.com/JimTheMan/Number-Guessing-Node-Command-Line-MMOG).

## What It Is
This project is made up of two parts: the server code and hte client code. The server code is sort of just a never-ending NodeJS process that you could run on any linux instance (or locally in a command line window to test it out).

The client, in this case, is an application that runs in the browser and is meant to be controlled by a desktop keyboard. When the client loads up, the map appears with no characters. The user can then type his or her name into the input box in the upper left corner and click the "Play!" button. This will create a character on the screen that the user can control. All users who connect to the server join the same room meaning that others can see this user walk around, and from the client you can see other users connected. There is no messaging or attacking in this simple example; you just walk around. ;)

<img src="./Number-Guessing-Game-Screenshot.png" width="800px"/>

## Usage

### Server

1) Navigate into the server folder in your command shell.

`cd server`

2) Install dependencies.

`npm install`

3) Run Server File.

`node room-walker-server.js`

### Client
* Note: Make sure server is running before trying to connect from client.

1) Navigate into client folder.

` cd client`

2) Install dependencies.

`npm install`

3) Run a local webserver to host the client.

For example, you could use the python simple server:

`python -m SimpleHTTPServer [port]`

Then navigate in your browser to *http://0.0.0.0:[port]

where you would replace "[port]" with the actual port number you used when starting the server (default is usually 8080). 
