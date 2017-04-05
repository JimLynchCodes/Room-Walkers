const WebSocket = require('ws');
const util = require('util');

const wss = new WebSocket.Server({ port: 8889 });

// var magicNum = Math.ceil(Math.random() * 5);
// var champion = "James";
// var connections = [];

// if (process.env.INSTANCE_CONNECTION_NAME) {
//     config.socketPath = '/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}';
// }

console.log('server listening...');

wss.on('connection', function connection(ws) {

    connections.push({
        ws: ws,
        name: "",
        score: 0,
        xPos: 0,
        yPos: 0,
        directionFacing: 1
    });

    ws.on('message', function incoming(message, flags) {

        //var currentPlayer;

        //for (var i = 0; i < connections.length; i++) {
        //    if (connections[i].ws === ws) {
         //       currentPlayer = connections[i];
         //   }
        //}

        //var response;
        //var obj = JSON.parse(message);
:
        if (parseInt(obj.guess) === magicNum) {

            currentPlayer.score++;
            response = "HOLY COW! YOU GUESSED THE MAGIC NUMBER!!!" +
                "I now declare you, " + obj.name + ", the new champion! (You have correctly guessed ( "
                + currentPlayer.score + " ) numbers)";
            champion = obj.name;
            magicNum = Math.ceil(Math.random() * 5);

            ws.send(JSON.stringify({ response: response, prompt: true }));

            for (var i = 0; i < connections.length; i++) {
                if (connections[i].ws !== ws) {
                    response = "Uh oh, too slow! " + obj.name + " correctly guessed the number and is the new champion"
                        + " with " + currentPlayer.score + " correct guesses!";
                    connections[i].ws.send(JSON.stringify({ response: response, prompt: false }))
                }
            }

        } else {
            response = "Sorry, that's not the magic number. The champion is still " + champion + ".";
            ws.send(JSON.stringify({ response: response, prompt: true }));
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


