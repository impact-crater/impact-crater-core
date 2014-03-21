ig.module('game.server.entities.drone')
.requires(
    'plugins.server'
)
.defines(function() {

    EntityDrone = EntityServer.extend({
        size: { x: 32, y: 32 },
        speed: 20, 
        init: function(x, y, settings) {
            this.parent(x, y, settings);

            var self = this;
            var half = this.speed / 2;
            this.moveInterval = setInterval(function() {
                self.vel.x = Math.floor(Math.random() * self.speed - half);
                self.vel.y = Math.floor(Math.random() * self.speed - half);
            }, 2000);
        },
        kill: function() {
            this.parent();
            clearInterval(this.moveInterval);
        }
    });

});
