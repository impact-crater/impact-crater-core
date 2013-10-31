var Canvas = require('canvas');
var path = require('path');
try {
    var config = require(__dirname + '/config.js');
} catch (err) {
    throw "Missing config file. Run 'cp server/config.js.example server/config.js'.";
}
var impactPath = path.dirname(__dirname) + '/impact/lib';
// Alter the env to allow impact
// to run without DOM interaction.
global.window = global;
global.ImpactMixin = {
    module: function() { return ig; },
    requires: function() { 
        var requires = Array.prototype.slice.call(arguments);
        // Go ahead and require the proper files
        requires.forEach(function(name) {
            // Ignore any dom ready type stuff on the server.
            if (name == 'dom.ready') return;
            var path = name.replace(/\./g, '/');
            require(impactPath + '/' + path);    
        });
        return ig; 
    },
    defines: function(func) { 
        func(); // immediately execute
    },
    $: function(selector) {
        var canvas = new Canvas(200, 200);
        canvas.addEventListener = function() { };
        canvas.style = { };
        return canvas;
    }
};
window.document = { };
window.addEventListener = function() { };

// Canvas should be the only element impact uses on the server.
window.HTMLElement = Canvas;
require(impactPath + '/impact/impact.js');
// Setup the websockets
ig.io = require('socket.io').listen(config.port);
ig.io.set('log level', 1);
// Setup the latency checking
ig.latency = require(__dirname + '/latency');

// Start the game. The game will take full control
// of node from now on.
require(impactPath + '/game/server/main.js');
