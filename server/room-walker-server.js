const WebSocket = require('ws');
const util = require('util');

const wss = new WebSocket.Server({ port: 8889 });

var connections = [];

console.log('server listening...');

const MOVE_AMOUNT = 5;
const currentPlayer = {xPos: 100, yPos: 270, name:"Jim"};

wss.on('connection', function connection(ws) {

    console.log('someone connected!')
    connections.push({
        ws: ws,
        name: "",
        score: 0,
        xPos: 0,
        yPos: 0,
        directionFacing: 0
    });

    var players = [];

    ws.on('open', function () {
        console.log('websocket opened');
    });


    ws.on('message', function incoming(message, flags) {


        console.log('received a message of type: ' + message);

        console.log('parsed type: ' + JSON.parse(message).type);

        switch (JSON.parse(message).type) {

            case 'PLAYER_MOVE': {
                broadcast(JSON.stringify({type:'PLAYER_MOVED',
                    payload: {
                    name: JSON.parse(message).payload.name,
                    xPos: JSON.parse(message).payload.xPos,
                    yPos: JSON.parse(message).payload.yPos,
                    direction: JSON.parse(message).payload.direction
                    }}
                ));

                break;
            }


            case 'PLAYER_JOIN': {
                var newPlayerName = JSON.parse(message).payload.name;
                console.log('a user joined: ' + newPlayerName);

                // players.push(newPlayerName)

                for (var i = 0; i < connections.length; i++) {
                if (connections[i].ws === ws) {
                    connections[i].name = JSON.parse(message).payload.name;
                }


                    console.log('## Player: ' + connections[i].name);
                }



  		broadcast(JSON.stringify({type:"USER_JOINED", payload: {name: newPlayerName,
            xPos:35, yPos: 25}}));

            // ws.send(JSON.stringify({type:"USER_JOINED", payload: {name:"Jim", xPos:45, yPos: 50}}));

            break;
            }

        }
    });

    ws.on('close', function (a, b) {

        for (var i = 0; i < connections.length; i++) {
            if (connections[i].ws === ws) {
                connections.pop(i);
                console.log('removing connection from array');
            }
        }
        console.log('current connections now: ' + connections.length);
    })
});


function getCurrentPlayerFromWsConnection(ws) {
    for (var i = 0; i < connections.length; i++) {
        if (connections[i].ws === ws) {
            return connections[i];
        }
    }
}

broadcast = function (messageObj) {
    for (var i = 0; i < connections.length; i++) {

        console.log('sending message! ' + messageObj);
        connections[i].ws.send(messageObj);
    }
};
