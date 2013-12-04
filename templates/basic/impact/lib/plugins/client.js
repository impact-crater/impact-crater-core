ig.module(
    'plugins.client'
)
.requires(
    'impact.game',
    'impact.entity'
)
.defines(function() {
    // Borrowed from underscore.js
    ig.throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options || (options = {});
        var later = function() {
            previous = options.leading === false ? 0 : new Date;
            timeout = null;
            result = func.apply(context, args);
        };
        return function() {
            var now = new Date;
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };
    // This class handles all the communications with the server.
    Client = ig.Class.extend({
        mousePos: { x: 0, y: 0 },
        screenPos: { x: 0, y: 0 },
        socket: null,
        init: function() {
            var self = this;
            var clientColor = '#e87511';
            var moves = 0;
            var throttledMove = ig.throttle(function() {
                ig.mark('entity.move: ' + moves, clientColor);
                moves = 0;
            }, 2000);
            if (typeof ClientHost == "undefined")
                throw 'ClientHostNotSetError. Set the ClientHost in index.html.';
            this.socket = io.connect(ClientHost);
            // This client's events
            this.socket.on('connect', function() {
                ig.mark('io.connect', clientColor);
                self.connected(this); 
            }).on('reconnect', function() {
                ig.mark('io.reconnect', clientColor);
                self.reconnected(this);
            }).on('disconnect', function() {
                ig.mark('io.disconnect', clientColor);
                self.disconnected(this); 
            // Latency events
            }).on('ping', function() {
                this.emit('pong');
            }).on('latency', function(latency) {
                // Do something with the latency
            // Entity events
            }).on('entity.create', function(data) {
                ig.mark('entity.create', clientColor);
                self.entityCreated(data);
            }).on('entity.move', function(data) {
                moves++;
                throttledMove();
                self.entityMoved(data);
            }).on('entity.remove', function(data) {
                ig.mark('entity.remove', clientColor);
                self.entityRemoved(data);
            // Other client events
            }).on('client.connect', function(data) {
                ig.mark('client.connect', clientColor);
                self.clientConnected(data.id);
            }).on('client.disconnect', function(data) {
                ig.mark('client.disconnect', clientColor);
                self.clientDisconnected(data.id);
            }).on('client.reconnect', function(data) {
                ig.mark('client.reconnect', clientColor);
                self.clientReconnected(data.id);
            }).on('system.set-game', function(data) {
                
            });
        },
        // This client's events
        // ----------------------------------------
        connected: function(socket) { },
        // Be sure to call this.parent() to remove entities on reconnect
        // if you override this function.
        reconnected: function(socket) { 
            ig.game.entities.forEach(function(ent) {
                ig.game.removeEntity(ent);
            });
        },
        disconnected: function(socket) { },
        // Other client events
        // ----------------------------------------
        clientConnected: function(id) { },
        clientDisconnected: function(id) { },
        clientReconnected: function(id) { },
        // Entity events
        // ----------------------------------------
        entityCreated: function(data) {
            var ent = ig.game.spawnEntity(window[data.type], data.x, data.y, data.settings);
            ent.type = data.type;
            ig.log('[INFO] Created entity: ' + data.type + ', X: ' + parseInt(data.x) + ', Y: ' + parseInt(data.y) + ', name: ' + data.settings.name);
        },
        entityMoved: function(data) {
            var entity = ig.game.getEntityByName(data.name); 
            if (!entity) return;
            entity.anim = data.anim;
            entity.nextPos = { x: data.x, y: data.y, a: data.a };
        },
        entityRemoved: function(data) {
            var entity = ig.game.getEntityByName(data.name);
            if (!entity) return;
            ig.log('[INFO] Destroyed entity: ' + entity.type + ', name: ' + entity.name);
            entity.kill();
        },
        // Helper methods
        // ----------------------------------------
        getClientId: function() {
            return this.socket.socket.sessionid;
        },
        // Notify the server if the screen has moved.
        checkScreen: function() {
            if (this.screenPos.x != ig.game.screen.x ||
                this.screenPos.y != ig.game.screen.y) {
                this.screenPos.x = ig.game.screen.x;
                this.screenPos.y = ig.game.screen.y;
                this.screenMovement(); 
            }
        },
        // Notify the server of any mouse movement.
        checkMouse: function() {
            if (this.mousePos.x != ig.input.mouse.x ||
                this.mousePos.y != ig.input.mouse.y) {
                this.mousePos.x = ig.input.mouse.x;
                this.mousePos.y = ig.input.mouse.y;
                this.mouseMovement();
            }
        },
        // NOTE: Should add a throttle for the functions below.
        _inputEvents: 0,
        _inputMarkThrottle: ig.throttle(function() { 
            ig.mark('input.event: ' + ig.client._inputEvents, '#fada5e');
            ig.client._inputEvents = 0;
        }, 2000),
        input: function(type, action) {
            this._inputEvents++;
            this._inputMarkThrottle();
            this.emit('input.event', { type: type, action: action });
        },
        _screenEvents: 0,
        _screenMarkThrottle: ig.throttle(function() { 
            ig.mark('screen.move: ' + ig.client._screenEvents, '#fada5e');
            ig.client._screenEvents = 0;
        }, 2000),
        screenMovement: function() {
            this._screenEvents++;
            this._screenMarkThrottle();
            this.emit('screen.move', { 
                x: ig.game.screen.x, 
                y: ig.game.screen.y 
            });
        },
        _mouseEvents: 0,
        _mouseMarkThrottle: ig.throttle(function() { 
            ig.mark('mouse.move: ' + ig.client._mouseEvents, '#fada5e');
            ig.client._mouseEvents = 0;
        }, 2000),
        mouseMovement: function() {
            this._mouseEvents++;
            this._mouseMarkThrottle();
            this.emit('input.mousemove', { 
                x: ig.input.mouse.x, 
                y: ig.input.mouse.y 
            });
        },
        emit: function(key, data) {
            this.socket.emit(key, data);
        }
    });

    GameClient = ig.Game.extend({
        update: function() {
            this.parent();
            if (!ig.client) return;

            ig.client.checkScreen();
            ig.client.checkMouse();
        },
    });

    // This entity should only move when told by the server.
    EntityClient = ig.Entity.extend({
        anim: '',
        binds: { },
        nextPos: { x: 0, y: 0, a: 0 },
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.nextPos = { x: x, y: y, a: 0 };
        },
        update: function() {
            if (this.currentAnim)
                this.currentAnim.update();

            if (this.nextPos) {
                this.pos.x = this.nextPos.x;
                this.pos.y = this.nextPos.y;
                if (this.currentAnim)
                    this.currentAnim.angle = this.nextPos.a;
            }
        }
    });

    // Change the input class in place so the server
    // may be notified when an action is triggered.
    ig.Input.inject({
        triggerEvent: function(event, type) {
            var code = event.type == type 
                ? event.keyCode 
                : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
            var action = this.bindings[code];
            if (action && ig.client.input)
                ig.client.input(type, action);
        },
        keydown: function(event) {
            this.triggerEvent(event, 'keydown');
            this.parent(event);
        },
        keyup: function(event) {
            this.triggerEvent(event, 'keyup');
            this.parent(event);
        }
    });

    ig.System.inject({
        setClient: function(clientClass) {
            // Wait until a game has been established before
            // hitting the server.
            var interval = setInterval(function() {
                if (ig.game) {
                    ig.client = new (clientClass)();
                    clearInterval(interval);
                }
            }, 100);
        }
    });

    // Rewrite this function to delay and allow the client class to setup.
    ig.main = function(canvasId, gameClass, fps, width, height, scale, loaderClass) {
        ig.system = new ig.System(canvasId, fps, width, height, scale || 1);
        ig.input = new ig.Input();
        ig.soundManager = new ig.SoundManager();
        ig.music = new ig.Music();
        ig.ready = true;
        
        var loader = new (loaderClass || ig.Loader)(gameClass, ig.resources);
        setTimeout(function() {
            loader.load();
        }, 100);
    };
});
