ig.module(
    'plugins.server'
)
.requires(
    'impact.game',
    'impact.entity',
    'impact.loader',
    'impact.input',
    'impact.system'
)
.defines(function() {
    GameServer = ig.Game.extend({
        init: function() {
            var self = this;
            self.clients = { };
            ig.io.sockets.on('connection', function(socket) {
                var id = socket.id;
                socket.on('disconnect', function() {
                    self.clients[id] = undefined;
                    self.clientDisconnected(this);
                    console.log('[INFO] Client disconnected: ' + id);
                }).on('reconnect', function() {
                    self.clientReconnected(self);
                    console.log('[INFO] Client reconnected: ' + id);
                });

                self.clients[id] = socket;
                // Each client needs its own input class.
                socket.input = new ig.Input();
                socket.screen = { x: 0, y: 0 };
                ig.latency(socket);

                socket.on('screen.move', function(obj) {
                   this.screen.x = obj.x;
                   this.screen.y = obj.y;
                });

                socket.on('input.event', function(obj) {
                    socket.input['set_' + obj.type](obj.action);
                });

                socket.on('input.mousemove', function(obj) {
                    this.input.mouse.x = obj.x;
                    this.input.mouse.y = obj.y;
                });

                // Send the client all the active entities
                self.entities.forEach(function(ent) {
                    self.entityCreate(ent.classType, ent.pos.x, ent.pos.y, {
                        name: ent.name
                    }, socket);
                    self.entityMove(ent, socket);
                });
                self.clientConnected(socket);
                console.log('[INFO] Client connected: ' + id);
            });
        },
        clientConnected: function(socket) { },
        clientReconnected: function(socket) { },
        clientDisconnected: function(socket) { 
            // Remove all entities for the client that disconnected.
            console.log('[INFO] Removing ' + this.entities.length + ' entities');
            var cnt = this.entities.length - 1;
            for (var i = cnt; i >= 0; i--) {
                var ent = this.entities[i];
                // Use removeEntity instead of kill.
                if (ent.owner == socket.id)
                    this.removeEntity(this.entities[i]);
            }
        },

        spawnEntity: function(type, x, y, settings) {
            // Find the key for the entity type
            var key = '';
            for (var i in global)
                if (global[i] == type)
                    key = i;
            settings = settings || { };
            // Give the entity a unique name. This is the entity id.
            // The server will tell the clients how to move entities based on this id.
            settings.name = ig.Entity._lastId + 1;
            settings.classType = key;
            // If socket is provided then set the
            // owner id from the socket then remove it.
            var socket = null;
            // Remove the socket reference before sending it
            // to the clients.
            if (settings.socket) {
                socket = settings.socket;
                settings.owner = socket.id;
                delete settings.socket;
            }
            this.entityCreate(key, x, y, settings);
            if (socket)
                settings.socket = socket;
            // Delay the entity creation until all
            // clients are aware of the entity.
            return this.parent(global[key], x, y, settings);
        },

        removeEntity: function(entity) {
            if (entity instanceof EntityServer)
                this.entityRemove(entity);
            this.parent(entity);
        },

        entityCreate: function(typeStr, x, y, settings, toSocket) {
            var recipients = toSocket || ig.io.sockets;
            recipients.emit('entity.create', {
                type: typeStr, x: x, y: y, settings: settings
            });
        },

        entityMove: function(entity, toSocket) {
            var recipients = toSocket || ig.io.sockets;
            var pos = entity.getPos();
            recipients.emit('entity.move', {
                name: entity.name, 
                x: pos.x, 
                y: pos.y, 
                a: pos.a, 
                anim: entity.anim
            });
        },

        entityRemove: function(entity, toSocket) {
            var recipients = toSocket || ig.io.sockets;
            recipients.emit('entity.remove', {
                name: entity.name
            });
        }
    });

    EntityServer = ig.Entity.extend({
        killed: function(ent) { }, // simple callback when this entity is killed.
        // Stub the currentAnim property
        currentAnim: { 
            angle: 0, 
            update: function() { }, 
            draw: function() { }
        },
        init: function(x, y, settings) {
            if (settings.socket) {
                this.input = settings.socket.input;
                this.screen = settings.socket.screen;
                this.anim = '';
                delete settings.socket;
            }
            this.parent(x, y, settings);
        }, 
        spawn: function(type, x, y, settings) {
            var ent = ig.game.spawnEntity(type, x, y, settings);

            if (this.owner) {
                ent.owner = this.owner;
            }
            return ent;
        },
        update: function() {
            this.last = this.getPos();
            this.parent();
        },
        draw: function() {
            this.parent();
            var cur = this.getPos();
            if (this.last.x != cur.x ||
                this.last.y != cur.y ||
                this.last.a != cur.a)
                ig.game.entityMove(this);
            else if (this.anim) {
                this.anim = '';
                ig.game.entityMove(this);
            }
        },
        getPos: function() {
            return {
                x: this.pos.x,
                y: this.pos.y,
                a: this.currentAnim ? this.currentAnim.angle : 0
            };
        },
        kill: function() {
            this.parent();
            this.killed(this);
        }
    });

    // No need to loads images, etc.
    ig.Loader = ig.Loader.extend({
        load: function() {
            ig.system.setGame(this.gameClass);
        }
    });

    // Allow input to be triggered by clients.
    ig.Input = ig.Input.extend({
        set_keydown: function(action) {
			this.actions[action] = true;
			if (!this.locks[action]) {
				this.presses[action] = true;
				this.locks[action] = true;
			}
        },
        set_keyup: function(action) {
            this.delayedKeyup[action] = true;
        }
    });

    // System needs to reset client inputs.
    ig.System = ig.System.extend({
        run: function() {
            this.parent();
            // Clear all the inputs for the sockets.
            for (var i in ig.game.clients) {
                if (ig.game.clients[i] && ig.game.clients[i].input)
                    ig.game.clients[i].input.clearPressed();
            }
        }
    });
    // Extending system for some reason excludes these settings.
    // But the server doesnt really need them anyway.
    ig.System.DRAW = {
        AUTHENTIC: function( p ) { return Math.round(p) * this.scale; },
        SMOOTH: function( p ) { return Math.round(p * this.scale); },
        SUBPIXEL: function( p ) { return p * this.scale; }
    };
    ig.System.drawMode = ig.System.DRAW.SMOOTH;

    ig.System.SCALE = {
        CRISP: function( canvas, context ) { },
        SMOOTH: function( canvas, context ) { }
    };
    ig.System.scaleMode = ig.System.SCALE.SMOOTH;
});
