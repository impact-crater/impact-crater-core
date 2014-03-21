ig.module( 
	'game.server.main' 
)
.requires(
    'plugins.server',
    'game.levels.field',
    'game.server.entities.player',
    'game.server.entities.drone'
)
.defines(function() {

    // This handles all the network logic and is now seperated from the game class.
    // You can access this instance at ig.server.
    MyServer = Server.extend({
        clientConnected: function(socket) {
            // Must call the parent class to intialize the network functionality.
            this.parent(socket);
            ig.game.spawnEntity(EntityPlayer, 50, 50, { socket: socket });
        }
    });

    MyGame = GameServer.extend({
        init: function() {
            this.loadLevel(LevelField);
            ig.game.spawnEntity(EntityDrone, 100, 100);
        }
    });

    ig.main('#canvas', MyGame, 60, 320, 240, 2);
    ig.system.setServer(MyServer);

});
