ig.module(
    'plugins.client'
)
.requires(
    'impact.game',
    'impact.entity'
)
.defines(function() {
    // This class handles all the communications with the server.
    GameClient = ig.Game.extend({
        mousePos: { x: 0, y: 0 },
        screenPos: { x: 0, y: 0 },
        socket: null,
        init: function() {
            var self = this;
            if (typeof ClientHost == "undefined")
                throw 'ClientHostNotSetError. Set the ClientHost in index.html.';
            this.socket = io.connect(ClientHost);
            // This client's events
            this.socket.on('connect', function() {
               self.connected(this); 
            }).on('reconnect', function() {
               self.reconnected(this);
            }).on('disconnect', function() {
               self.disconnected(this); 
            // Latency events
            }).on('ping', function() {
                this.emit('pong');
            }).on('latency', function(latency) {
                // Do something with the latency
            // Entity events
            }).on('entity.create', function(data) {
                self.entityCreated(data);
            }).on('entity.move', function(data) {
                self.entityMoved(data);
            }).on('entity.remove', function(data) {
                self.entityRemoved(data);
            // Other client events
            }).on('client.connect', function(data) {
                self.clientConnected(data.id);
            }).on('client.disconnect', function(data) {
                self.clientDisconnected(data.id);
            }).on('client.reconnect', function(data) {
                self.clientReconnected(data.id);
            });
        },
        update: function() {
            this.parent();
            this.checkScreen();
            this.checkMouse();
        },
        // This client's events
        // ----------------------------------------
        connected: function(socket) { },
        // Be sure to call this.parent() to remove entities on reconnect
        // if you override this function.
        reconnected: function(socket) { 
            var self = this;
            this.entities.forEach(function(ent) {
                self.removeEntity(ent);
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
            var ent = this.spawnEntity(window[data.type], data.x, data.y, data.settings);
            ent.type = data.type;
            ig.log('[INFO] Created entity: ' + data.type + ', X: ' + parseInt(data.x) + ', Y: ' + parseInt(data.y) + ', name: ' + data.settings.name);
        },
        entityMoved: function(data) {
            var entity = this.getEntityByName(data.name); 
            if (!entity) return;
            entity.anim = data.anim;
            entity.nextPos = { x: data.x, y: data.y, a: data.a };
        },
        entityRemoved: function(data) {
            var entity = this.getEntityByName(data.name);
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
            if (this.screenPos.x != this.screen.x ||
                this.screenPos.y != this.screen.y) {
                this.screenPos.x = this.screen.x;
                this.screenPos.y = this.screen.y;
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
        input: function(type, action) {
            this.socket.emit('input.event', { type: type, action: action });
        },
        screenMovement: function() {
            this.socket.emit('screen.move', { 
                x: this.screen.x, 
                y: this.screen.y 
            });
        },
        mouseMovement: function() {
            this.socket.emit('input.mousemove', { 
                x: ig.input.mouse.x, 
                y: ig.input.mouse.y 
            });
        }
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
    ig.Input = ig.Input.extend({
        triggerEvent: function(event, type) {
            var code = event.type == type 
                ? event.keyCode 
                : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
            var action = this.bindings[code];
            if (action && ig.game.input)
                ig.game.input(type, action);
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
});
