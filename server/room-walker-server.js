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

    // ws.send(JSON.stringify({type:'CONNECTION_INIT', x: 50, y:270}));

    ws.on('open', function () {
        console.log('websocket opened');
    })


    ws.on('message', function incoming(message, flags) {


        console.log('received a message of type: ' + message);

        console.log('parsed type: ' + JSON.parse(message).type);

        switch (JSON.parse(message).type) {


            // case 'USER_JOIN': {
            //
            //     console.log('sending...');
            //
            //     ws.send(JSON.stringify({type:'USER_JOINED', xPos: 100, yPos: 270}));
            //     // return broadcast(JSON.stringify({type:'USER_JOINED', xPos: 100, yPos: 270}))
            //     break;
            //
            // }


            case 'PLAYER_MOVE': {
                ws.send(JSON.stringify({type:'PLAYER_MOVED',
                    payload: {
                    name: "Jim",
                    xPos: JSON.parse(message).payload.xPos,
                    yPos: JSON.parse(message).payload.yPos}
                    }
                ));

            }
            // case 'PLAYER_MOVE':
            // {
            //
            //
            //     console.log('got stuff: ' + message);
            //     console.log('player : ' + " " + " wants to move: " + JSON.parse(message).payload.direction);
            //
            //     // var currentPlayer = getCurrentPlayerFromWsConnection(ws);
            //
            //
            //
            //         console.log('updating player position! ' + MOVE_AMOUNT);
            //
            //         switch (JSON.parse(message).payload.direction) {
            //             case 0:
            //             {
            //                 currentPlayer.yPos -= MOVE_AMOUNT;
            //
            //                 break;
            //             }
            //             case 1:
            //             {
            //                 // console.log('adding some! ' + currentPlayer.xPos);
            //                 currentPlayer.xPos += MOVE_AMOUNT;
            //                 // console.log('adding some! ' + currentPlayer.xPos);
            //                 break;
            //
            //             }
            //             case 2:
            //             {
            //                 currentPlayer.yPos += MOVE_AMOUNT;
            //
            //                 break;
            //             }
            //             case 3:
            //             {
            //                 console.log('changing y');
            //                 currentPlayer.xPos -= MOVE_AMOUNT;
            //                 break;
            //
            //             }
            //             default: {
            //                 console.log('couldn\'t find direction: ' + JSON.parse(message).payload.direction);
            //             }
            //         }
            //
            //         return broadcast({ type: "PLAYER_MOVED", payload: { player: currentPlayer.name, xPos:currentPlayer.xPos, yPos:currentPlayer.yPos }});
            //
            //     }
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

        console.log('sending message!');
        connections[i].ws.send(JSON.stringify(messageObj));
    }
};
