ig.module(
    'plugins.client'
)
.requires(
    'impact.game',
    'impact.entity'
)
.defines(function() {
    // This class handles all the communications with the server.
    // Also handles the latency requests from the server.
    GameClient = ig.Game.extend({
        mousePos: { x: 0, y: 0 },
        screenPos: { x: 0, y: 0 },
        init: function() {
            var self = this;
            if (typeof ClientHost == "undefined")
                throw 'ClientHostNotSetError. Set the ClientHost in index.html.';
            self.socket = io.connect(ClientHost);
            self.socket.on('reconnect', function() {
                console.log('Reconnecting... removing all entities.');
                self.entities.forEach(function(ent) {
                    self.removeEntity(ent);
                });
            });
            self.socket.on('ping', function() {
                this.emit('pong');
            }).on('latency', function(latency) {
                // Do something with the latency
            });
            // Any entity events from the server only apply to EntityClients.
            self.socket
              .on('entity.create', function(data) {
               var ent = self.spawnEntity(window[data.type], data.x, data.y, data.settings);
               ent.type = data.type;
               console.log('Created entity: ' + data.type + ', X: ' + data.x + ', Y: ' + data.y + ', name: ' + data.settings.name);
            }).on('entity.move', function(data) {
                var entity = ig.game.getEntityByName(data.name); 
                if (!entity) return;
                entity.anim = data.anim;
                entity.nextPos = { x: data.x, y: data.y, a: data.a };
            }).on('entity.remove', function(data) {
                var entity = ig.game.getEntityByName(data.name);
                if (!entity) return;
                console.log('Destroyed entity: ' + entity.type + ', name: ' + entity.name);
                entity.kill();
            });
        },
        getClientId: function() {
            return this.socket.socket.sessionid;
        },
        update: function() {
            this.parent();
            this.checkScreen();
            this.checkMouse();
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
                x: ig.game.screen.x, 
                y: ig.game.screen.y 
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
        },
        // This entity will keep track of the inputs binded
        // and transmit them to the server when necessary.
        inputBind: function(key, action) {
           this.binds[key] = action; 
           ig.input.bind(key, action);
        }
    });

    // Change the input class in place so the server
    // may be notified when an action is triggered.
    ig.Input = ig.Input.extend({
        keydown: function(event) {
            var code = event.type == 'keydown' 
                ? event.keyCode 
                : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);

            var action = this.bindings[code];
            if (action) ig.game.input('keydown', action);
            this.parent(event);
        },
        keyup: function(event) {
            var code = event.type == 'keyup' 
                ? event.keyCode 
                : (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);

            var action = this.bindings[code];
            if (action) ig.game.input('keyup', action);
            this.parent(event);
        }
    });
});
