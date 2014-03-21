var path = require('path');
var fs = require('fs');

module.exports = function(serverPath) {
    var scriptPath = serverPath || __dirname;
    process.chdir(scriptPath);

    try {
        var config = require(scriptPath + '/config.js');
    } catch (err) {
        throw "Missing config.js. Run 'cp server/config.js.example server/config.js'.";
    }

    // Setup paths
    var root = path.dirname(scriptPath);
    var impactPath = root + '/' + config.impact;
    var impactLibPath = impactPath + '/lib';
    var publicPath = root + '/' + config.assets;

    if (!fs.existsSync(publicPath + '/index.ejs'))
        throw "Missing index.ejs. Run 'cp public/index.ejs.example public/index.ejs'.";

    // Alter the env to allow impact
    // to run without DOM interaction.
    var Canvas = function() {
        return {
            addEventListener: function() { },
            style: { },
            getContext: function() {
                // This is the context
                return {
                    save: function() { },
                    translate: function() { },
                    rotate: function() { },
                    restore: function() { },
                    drawImage: function() { },
                    strokeRect: function() { },
                    beginPath: function() { },
                    moveTo: function() { },
                    lineTo: function() { },
                    stroke: function() { },
                    clearPath: function() { },
                    scale: function() { },
                    fillRect: function() { }
                };
            }
        };
    };
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
                require(impactLibPath + '/' + path);
            });
            return ig;
        },
        defines: function(func) {
            func(); // immediately execute
        },
        $: function(selector) {
            return new Canvas();
        }
    };
    window.document = { };
    window.addEventListener = function() { };

    // Canvas should be the only element impact uses on the server.
    window.HTMLElement = Canvas;
    require(impactLibPath + '/impact/impact.js');

    // Setup the webserver
    var express = require('express');
    var http = require('http');
    var app = express();
    app.enable("jsonp callback");
    var server = app.listen(config.port);
    // Setup the websockets
    ig.io = require('socket.io').listen(server);
    ig.io.set('log level', 1);

    // Setup the latency checking
    ig.latency = require(scriptPath + '/latency');

    // Setup routes and asset paths
    app.use(express.static(publicPath));
    app.use('/impact', express.static(impactPath));
    app.get('/', function(req, res) {
        res.render(publicPath + '/index.ejs', { config: config });
    });

    return {
        config: config,
        ig: ig,
        web: app,
        io: ig.io,
        // Start a game
        start: function() {
            require(impactLibPath + '/game/server/main.js');
        },
        beforePageLoad: function(req, res) { }
    };
};
