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
        clients: { },
        init: function() {
            var self = this;
            ig.io.sockets.on('connection', function(socket) {
                socket.on('disconnect', function() {
                    self.clientDisconnected(this);
                }).on('reconnect', function() {
                    self.clientReconnected(this);
                }).on('screen.move', function(obj) {
                   this.screen.x = obj.x;
                   this.screen.y = obj.y;
                }).on('input.event', function(obj) {
                    socket.input['set_' + obj.type](obj.action);
                }).on('input.mousemove', function(obj) {
                    this.input.mouse.x = obj.x;
                    this.input.mouse.y = obj.y;
                });
                self.clientConnected(socket);
            });
            // Every second calculate the average ping for clients.
            this.clientInterval = setInterval(function() {
                var total = i = 0;
                for (var key in self.clients) {
                    if (!self.clients[key]) continue;
                    total += self.clients[key].latency.avg;
                    i++;
                }
                self.clientAvgPing = parseInt(total / i);
            }, 1000);
        },
        emit: function(to, key, data) {
            if (!to) return;
            return to.emit(key, data);
        },
        broadcast: function(key, data) {
            // Account for the average client ping.
            var self = this;
            for (var i in this.clients) {
                var client = this.clients[i];
                if (!client) continue;
                if (client.latency.avg >= this.clientAvgPing)
                    this.emit(client, key, data);
                else
                    setTimeout(function() {
                        self.emit(client, key, data);
                    }, this.clientAvgPing - client.latency.avg);
            }
        },
        clientConnected: function(socket) { 
            console.log('[INFO] Client connected: ' + socket.id);
            this.clients[socket.id] = socket;
            // Each client needs its own input class.
            socket.input = new ig.Input();
            socket.screen = { x: 0, y: 0 };
            ig.latency(socket);
            // Send the client all the active entities
            var self = this;
            this.entities.forEach(function(ent) {
                self.entityCreate(ent.classType, ent.pos.x, ent.pos.y, ent._settings, socket);
                self.entityMove(ent, socket);
            });
            this.broadcast('client.connect', { id: socket.id });
        },
        clientReconnected: function(socket) { 
            console.log('[INFO] Client reconnected: ' + socket.id);
            this.broadcast('client.reconnect', { id: socket.id });
        },
        clientDisconnected: function(socket) { 
            console.log('[INFO] Client disconnected: ' + socket.id);
            this.broadcast('client.disconnect', { id: socket.id });
            this.clients[socket.id] = undefined;
            // Remove all entities for the client that disconnected.
            console.log('[INFO] Removing ' + this.entities.length + ' entities');
            // Count down so removing entities doesnt mess anything up.
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
            // If socket is provided then set the owner id
            if (settings.socket)
                settings.owner = settings.socket.id;
            var ent = this.parent(global[key], x, y, settings);
            // Remove the socket reference before sending it to the clients.
            var socket = null;
            if (settings.socket) {
                socket = settings.socket;
                settings.owner = socket.id;
                delete settings.socket;
            }
            this.entityCreate(key, ent.pos.x, ent.pos.y, settings);
            return ent;
        },
        removeEntity: function(entity) {
            if (entity instanceof EntityServer)
                this.entityRemove(entity);
            this.parent(entity);
        },
        entityCreate: function(typeStr, x, y, settings, toSocket) {
            var data = { type: typeStr, x: x, y: y, settings: settings };
            var key = 'entity.create';
            if (toSocket) this.emit(toSocket, key, data);
            else this.broadcast(key, data);
        },
        entityMove: function(entity, toSocket) {
            var pos = entity.getPos();
            var data = {
                name: entity.name, 
                x: pos.x, 
                y: pos.y, 
                a: pos.a, 
                anim: entity.anim
            };
            var key = 'entity.move';
            if (toSocket) this.emit(toSocket, key, data);
            else this.broadcast(key, data);
        },
        entityRemove: function(entity, toSocket) {
            var data = { name: entity.name };
            var key = 'entity.remove';
            if (toSocket) this.emit(toSocket, key, data);
            else this.broadcast(key, data);
        }
    });

    EntityServer = ig.Entity.extend({
        // simple callback when this entity is killed.
        killed: function(ent) { },
        // Stub the currentAnim property
        currentAnim: { 
            angle: 0, 
            update: function() { }, 
            draw: function() { }
        },
        init: function(x, y, settings) {
            var socket = settings.socket || undefined;
            settings.socket = undefined;
            // Cache the settings so when a client joins
            // we can pass the same settings.
            this._settings = settings;
            if (socket) {
                this.socket = socket;
                this.input = socket.input;
                this.screen = socket.screen;
                this.anim = '';
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
            if (this.last.x    != cur.x ||
                this.last.y    != cur.y ||
                this.last.a    != cur.a ||
                this.last.anim != cur.anim)
                ig.game.entityMove(this);
        },
        getPos: function() {
            return {
                x: this.pos.x,
                y: this.pos.y,
                a: this.currentAnim ? this.currentAnim.angle : 0,
                anim: this.anim
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
