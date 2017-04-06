var TopDownGame = TopDownGame || {};

// var WebSocket = window.WebSocket;

// const ws = new WebSocket('ws://104.196.54.87:443');
// const ws = new WebSocket('ws://120.0.0.1:443');

var player;
var oldX;
var oldY;


function connectToServer() {
  var ws = new WebSocket('ws://127.0.0.1:8889');

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
    ws.send(JSON.stringify({type:"USER_JOIN"}));

  };

  ws.addEventListener('message', function (event) {
    console.log('Message from server', event.data);
    console.log('Message type from server', JSON.parse(event.data));


    switch(JSON.parse(event.data).type) {
      case 'USER_JOINED': {
        player.y = JSON.parse(event.data).yPos;
        player.x = JSON.parse(event.data).xPos;
        console.log('putting player at x:' + player.x + " and y:" + player.y);

        break;
      }

      case 'PLAYER_MOVED': {
        player.y = JSON.parse(event.data).payload.yPos;
        player.x = JSON.parse(event.data).payload.xPos;
        console.log('putting player at x:' + player.x + " and y:" + player.y);

        break;
      }
    }


  });

  return ws;
}

//title screen
TopDownGame.Game = function(){};
var myWs;

TopDownGame.Game.prototype = {
  create: function() {

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

    this.createItems();
    this.createDoors();

    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');

    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);
    player = this.player;


    // console.log('player x: ' + this.player.x + " y: " + this.player.y);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();




  },
  createItems: function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var item;    
    result = this.findObjectsByType('item', this.map, 'objectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
  },
  createDoors: function() {
    //create doors
    this.doors = this.game.add.group();
    this.doors.enableBody = true;
    result = this.findObjectsByType('door', this.map, 'objectsLayer');

    result.forEach(function(element){
      this.createFromTiledObject(element, this.doors);
    }, this);
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
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
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  update: function() {
    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

    //player movement
    this.player.body.velocity.y = 0;
    this.player.body.velocity.x = 0;


    if(this.cursors.up.isDown) {
      this.player.body.velocity.y -= 50;
      myWs.send(JSON.stringify({type:"PLAYER_MOVE", payload: {direction: 1, xPos:this.player.body.x, yPos:this.player.body.y}}));
    }
    else if(this.cursors.down.isDown) {
      this.player.body.velocity.y += 50;
      myWs.send(JSON.stringify({type:"PLAYER_MOVE", payload: {direction: 1, xPos:this.player.body.x, yPos:this.player.body.y}}));
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= 50;
      myWs.send(JSON.stringify({type:"PLAYER_MOVE", payload: {direction: 1, xPos:this.player.body.x, yPos:this.player.body.y}}));
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += 50;
      myWs.send(JSON.stringify({type:"PLAYER_MOVE", payload: {direction: 1, xPos:this.player.body.x, yPos:this.player.body.y}}));
    }
    oldX = this.player.body.x;
    oldY = this.player.body.y;
  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  },
  enterDoor: function(player, door) {
    console.log('entering door that will take you to '+door.targetTilemap+' on x:'+door.targetX+' and y:'+door.targetY);
  },
};