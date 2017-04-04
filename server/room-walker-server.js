const WebSocket = require('ws');
const util = require('util');

const wss = new WebSocket.Server({ port: 8889 });

var connections = [];

console.log('server listening...');

var MOVE_AMOUNT = 50;

wss.on('connection', function connection(ws) {

    connections.push({
        ws: ws,
        name: "",
        score: 0,
        xPos: 0,
        yPos: 0,
        directionFacing: 0
    });

    ws.on('message', function incoming(message, flags) {


        console.log('received a message of type: ' + message.type);

        switch (message.type) {

            case 'PLAYER_MOVED':
            {

                console.log('player : ' + " " + " wants to move: " + message.payload.direction);

                var currentPlayer = getCurrentPlayerFromWsConnection(ws);

                if (message.payload.direction === 1) {

                    console.log('updating player position!');

                    switch (message.payload.direction) {
                        case 0:
                        {
                            currentPlayer.yPos -= MOVE_AMOUNT;

                        }
                        case 1:
                        {
                            currentPlayer.xPos += MOVE_AMOUNT;

                        }
                        case 2:
                        {
                            currentPlayer.xPos -= MOVE_AMOUNT;

                        }
                        case 3:
                        {
                            currentPlayer.yPos += MOVE_AMOUNT;

                        }
                    }

                    broadcast({ type: "PLAYER_MOVED", payload: { player: currentPlayer } });

                }
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
            currentPlayer = connections[i];
        }
    }
}

broadcast = function (messageObj) {
    for (var i = 0; i < connections.length; i++) {
        connections[i].ws.send(messageObj);
    }
};