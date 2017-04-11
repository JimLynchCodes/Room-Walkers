const WebSocket = require('ws');
const util = require('util');

const wss = new WebSocket.Server({ port: 8889 });

var connections = [];

console.log('server listening...');

const MOVE_AMOUNT = 5;
const currentPlayer = { xPos: 100, yPos: 270, name: "Jim" };

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

            case 'PLAYER_MOVE':
            {

                console.log('player wants to move to: ' + JSON.parse(message).payload.xPos + " " +
                    JSON.parse(message).payload.yPos);

                for (var i = 0; i < connections.length; i++) {
                    if (connections[i].ws === ws) {

                        console.log('updating user');
                        connections[i].xPos = JSON.parse(message).payload.xPos;
                        connections[i].yPos = JSON.parse(message).payload.yPos;
                        connections[i].directionFacing = JSON.parse(message).payload.direction;
                    }
                }

                broadcast(JSON.stringify({
                        type: 'PLAYER_MOVED',
                        payload: {
                            name: JSON.parse(message).payload.name,
                            xPos: JSON.parse(message).payload.xPos,
                            yPos: JSON.parse(message).payload.yPos,
                            direction: JSON.parse(message).payload.direction
                        }
                    }
                ));

                break;
            }


            case 'PLAYER_JOIN':
            {
                var newPlayerName = JSON.parse(message).payload.name;
                console.log('a user joined: ' + newPlayerName);
                var playersAlreadyHere = [];

                for (var i = 0; i < connections.length; i++) {
                    if (connections[i].ws === ws) {
                        connections[i].name = JSON.parse(message).payload.name;
                        connections[i].xPos = 35;
                        connections[i].yPos = 95;

                    } else {

                        console.log("## connection: " + connections[i]);
                        console.log("## connection: " + connections[i].name);

                        playersAlreadyHere.push({
                            name: connections[i].name,
                            xPos: connections[i].xPos,
                            yPos: connections[i].yPos,
                            directionFacing: connections[i].directionFacing,
                            score: connections[i].score,
                        });
                    }
                }

                if (playersAlreadyHere.length > 0) {

                    console.log('sending USERS_ALREADY_HERE ' + JSON.stringify(playersAlreadyHere));
                    ws.send(JSON.stringify({
                        type: "USERS_ALREADY_HERE",
                        payload: { otherPlayers: playersAlreadyHere }
                    }))
                }

                broadcast(JSON.stringify({
                    type: "USER_JOINED",
                    payload: { name: newPlayerName, xPos: 35, yPos: 95 }
                }));

                break;
            }

        }
    });

    ws.on('close', function (a, b) {

        var quitter;

        for (var i = 0; i < connections.length; i++) {
            if (connections[i].ws === ws) {
                quitter = connections.splice(i, 1)[0];
                console.log('removing connection from array');
            }
        }

        if (quitter !== null && quitter !== undefined) {

            console.log('quitter is: ' + util.inspect(quitter.name));
            broadcast(JSON.stringify({ type: "PLAYER_QUIT", payload: { name: quitter.name } }))

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

        console.log('sending message! ' + messageObj + ' to ' + connections[i].name);
        connections[i].ws.send(messageObj);
    }
};
