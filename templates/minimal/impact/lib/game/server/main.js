ig.module( 
	'game.server.main' 
)
.requires(
    'plugins.server'
)
.defines(function() {
    // This handles all the network logic and is now seperated from the game class.
    // You can access this instance at ig.server.
    MyServer = Server.extend({

    });

    MyGame = GameServer.extend({

    });

    ig.main('#canvas', MyGame, 60, 320, 240, 2);
    ig.system.setServer(MyServer);
});
