var impact = require('./impact-crater');
/*
    impact.web -> The express web server. You can add additional paths if you want.
     impact.ig -> The impactjs namespace. If you are doing any database stuff attach the 
                  database here and use it within your server code.
     impact.io -> The socket.io namespace. You can attach additional event handlers here
                  but I recommend attaching socket event handlers in your GameServer class.
                  Refer to the plugins/server.js:GameServer class for attaching additional socket
                  event handlers.

    Example of showing the clients in the game via host/clients.
    impact.web.get('/clients', function(req, res) {
        var list = '';
        // Build a list of clients
        var clients = impact.ig.game.clients;
        for (var index in clients)
            list += '<li>' + clients[index].handshake.address.address + ': ' + clients[index].id + '</li>'; 
        // Send the output to the client.
        res.send([
            '<h2>', Object.keys(impact.ig.game.clients).length, ' client(s) in the game.</h2>',
            '<ul>', list, '</ul>'
        ].join(''));
    });

    Finally after setup start your game.
*/
impact.start();
