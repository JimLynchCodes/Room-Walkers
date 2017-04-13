var TopDownGame = TopDownGame || {};

// var WebSocket = window.WebSocket;

// const ws = new WebSocket('ws://104.196.54.87:443');
// const ws = new WebSocket('ws://120.0.0.1:443');

var player;
var oldX;
var oldY;
var ws;
var game;
var players = [];
var thisUsersName = "--";
var currentDirection = 1;

function connectToServer() {
    ws = new WebSocket('ws://127.0.0.1:8889');

    console.log('connecting to server...');

    console.log('browser socket is: ' + ws);

    ws.onconnection = function () {

        console.log('connecting to server still...')

    };

    ws.onconnection = function () {

        console.log('connected to server!')

    };

    ws.onopen = function () {

        console.log('connected to server!')
        // ws.send(JSON.stringify({type: "USER_JOIN"}));

    };

    ws.addEventListener('message', function (event) {
        console.log('Message from server', JSON.parse(event.data));
        console.log('Message type from server' + JSON.parse(event.data).type);


        switch (JSON.parse(event.data).type) {
            case 'USER_JOINED': {
                // player.y = JSON.parse(event.data).yPos;
                // player.x = JSON.parse(event.data).xPos;


                console.log('user joined name: ' + JSON.parse(event.data).payload.name);
                var userAlreadyJoined = false;

                for (var i = 0; i < players.length; i++) {
                    if (players[i].name === JSON.parse(event.data).payload.name) {
                        userAlreadyJoined = true;
                    }
                }

                if (!userAlreadyJoined) {

                    console.log('player should be at : ' + JSON.parse(event.data).payload.xPos +
                        ' and y: ' + JSON.parse(event.data).payload.yPos);

                    var newPlayer = game.add.sprite(JSON.parse(event.data).payload.xPos, JSON.parse(event.data).payload.yPos, 'player');
                    game.physics.arcade.enable(newPlayer);
                    // newPlayer.pivot.y.setTo(0, 0.5);
                    // newPlayer.pivot.x.setTo(0, 0.5);
                    newPlayer.name = JSON.parse(event.data).payload.name;
                        newPlayer.anchor.setTo(0.5, 0.5);
                    players.push(newPlayer);
                    // newPlayer.body.anchor.setTo(0.5, 0.5);

                    // newPlayer.pivot.y = newPlayerewPlayer.height * .5;
                    // newPlayer.pivot.x = newPlayerewPlayer.height * .5;


                    console.log('1: ' + newPlayer.name + " 2: " + thisUsersName);

                    if (newPlayer.name === thisUsersName) {

                        console.log('player is me!');
                    // TODO - If the player that joined is this useris this user
                        //the camera will follow the player in the world
                        game.camera.follow(newPlayer);
                        player = newPlayer;

                    }


                    console.log('putting player at x:' + newPlayer.x + " and y:" + newPlayer.y);
                }


                // player = player;

                break;
            }

            case 'PLAYER_MOVED': {

                console.log('user moved name: ' + JSON.parse(event.data).payload.name);

                console.log('looping over ' + players.length + " players");

                for (var i = 0; i < players.length; i++) {
                console.log('looping over ' + players[i].name + " players" + JSON.parse(event.data).payload.name);
                    if (players[i].name === JSON.parse(event.data).payload.name) {
                        // userAlreadyJoined = true;

                        players[i].y = JSON.parse(event.data).payload.yPos;
                        players[i].x = JSON.parse(event.data).payload.xPos;
                console.log('putting player at x:' + players[i].body.x + " and y:" + players[i].body.y);

                        if (JSON.parse(event.data).payload.direction === 2) {
                            players[i].scale.x = 1;
                        } else if (JSON.parse(event.data).payload.direction === 4) {
                            players[i].scale.x = -1;
                        }


                    }
                }



                break;
            }

            case "USERS_ALREADY_HERE": {


                console.log('handling USERS_ALREADY_HERE: ' + JSON.parse(event.data).payload);
                console.log('length: ' + JSON.parse(event.data).payload.otherPlayers.length);


                for (var i = 0; i < JSON.parse(event.data).payload.otherPlayers.length; i++) {

                    var newPlayer = game.add.sprite(JSON.parse(event.data).payload.otherPlayers[i].xPos,
                        JSON.parse(event.data).payload.otherPlayers[i].yPos, 'player');
                    game.physics.arcade.enable(newPlayer);
                    newPlayer.anchor.setTo(0.5, 0.5);
                    newPlayer.name = JSON.parse(event.data).payload.otherPlayers[i].name;
                    players.push(newPlayer);

                    if (JSON.parse(event.data).payload.otherPlayers[i].directionFacing === 2) {
                        newPlayer.scale.x = 1;
                    } else if (JSON.parse(event.data).payload.otherPlayers[i].directionFacing === 4) {

                       console.log('should be flipping...');
                        newPlayer.scale.x = -1;
                    }

                }


                break;
            }

            case "PLAYER_QUIT": {

                console.log('yes, the player quit: ' + JSON.parse(event.data).payload.name);

                for (var i =0; i < players.length; i++) {
                    if (players[i].name === JSON.parse(event.data).payload.name) {
                        console.log('destroying user! ' + players[i].name);
                        players[i].destroy();
                        players.splice(i, 1);
                    }
                }

                break;
            }
        }


    });

    return ws;
}

//title screen
TopDownGame.Game = function () {
};
var myWs;

TopDownGame.Game.prototype = {
    create: function () {

        myWs = connectToServer();

        this.map = this.game.add.tilemap('level1');

        //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
        this.map.addTilesetImage('tiles', 'gameTiles');

        //create layer
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        //collision on blockedLayer
        this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();

        // this.createItems();
        this.createDoors();

        //create player
        var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');

        // player = this.game.add.sprite(result[0].x, result[0].y, 'player');
        // this.game.physics.arcade.enable(player);
        // player = player;


        // console.log('player x: ' + player.x + " y: " + player.y);


        //move player with cursor keys
        this.cursors = this.game.input.keyboard.createCursorKeys();

        game = this.game;

    },
    createItems: function () {
        //create items
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        result = this.findObjectsByType('item', this.map, 'objectsLayer');
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },
    createDoors: function () {
        //create doors
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function (element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },

    //find objects in a Tiled layer that containt a property called "type" equal to a certain value
    findObjectsByType: function (type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function (element) {
            if (element.properties.type === type) {
                //Phaser uses top left, Tiled bottom left so we have to adjust
                //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                //so they might not be placed in the exact position as in Tiled
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },
    //create a sprite from an object
    createFromTiledObject: function (element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);

        //copy all properties to the sprite
        Object.keys(element.properties).forEach(function (key) {
            sprite[key] = element.properties[key];
        });
    },
    update: function () {
        if (player) {
            //collision
            this.game.physics.arcade.collide(player, this.blockedLayer);
            this.game.physics.arcade.overlap(player, this.items, this.collect, null, this);
            this.game.physics.arcade.overlap(player, this.doors, this.enterDoor, null, this);


            //player movement
            player.body.velocity.y = 0;
            player.body.velocity.x = 0;


            if (player.x !== oldX || player.y != oldY) {

                myWs.send(JSON.stringify({
                    type: "PLAYER_MOVE",
                    payload: {direction: currentDirection, xPos: player.x, yPos: player.y, name: thisUsersName}
                }));

                oldX = player.x;
                oldY = player.y;
            }


            if (this.cursors.up.isDown) {
                player.body.velocity.y -= 50;
                currentDirection = 1;

            }
            else if (this.cursors.down.isDown) {
                player.body.velocity.y += 50;
                currentDirection = 3;

            }
            if (this.cursors.left.isDown) {
                player.body.velocity.x -= 50;
                player.scale.x = -1;
                // myWs.send(JSON.stringify({
                //     type: "PLAYER_MOVE",
                //     payload: {direction: 1, xPos: player.x, yPos: player.y, name: thisUsersName}
                // }));
                currentDirection = 4;
            }
            else if (this.cursors.right.isDown) {
                player.body.velocity.x += 50;
                player.scale.x = 1;
                currentDirection = 2;
                // myWs.send(JSON.stringify({
                //     type: "PLAYER_MOVE",
                //     payload: {direction: 1, xPos: player.x, yPos: player.y, name: thisUsersName}
                // }));
            }
        }
    },
    collect: function (player, collectable) {
        console.log('yummy!');

        //remove sprite
        collectable.destroy();
    },
    enterDoor: function (player, door) {
        console.log('entering door that will take you to ' + door.targetTilemap + ' on x:' + door.targetX + ' and y:' + door.targetY);
    },
};

console.log('ok then');

setTimeout(function () {

    addListeners();
}, 100)

function addListeners() {
    console.log('in here!');

    document.getElementById("charInputBtn").addEventListener("click", function () {

        var inputText = document.getElementById("charNameInput").value;

        thisUsersName = inputText;
        console.log('user wants to playw ith name: ' + inputText);

        ws.send(JSON.stringify({type: "PLAYER_JOIN", payload: {name: inputText}}));
    });
};


