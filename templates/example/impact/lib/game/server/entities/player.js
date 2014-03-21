ig.module('game.server.entities.player')
.requires(
    'plugins.server'
)
.defines(function() {
    EntityPlayer = EntityServer.extend({
        speed: 100,
        init: function(x, y, settings) {
            this.parent(x, y, settings);

            // These inputs are triggered by clients sending their button presses
            // to the server which then triggers the appropriate entity's input functions.
            this.input.bind(ig.KEY.W, 'up');
            this.input.bind(ig.KEY.A, 'left');
            this.input.bind(ig.KEY.S, 'down');
            this.input.bind(ig.KEY.D, 'right');
        },

        update: function() {
            this.parent();

            if (this.input.state('up')) {
                this.vel.y = -this.speed;
                this.anim = 'up';
            } else if (this.input.state('down')) {
                this.vel.y = this.speed;
                this.anim = 'down';
            } else 
                this.vel.y = 0;

            if (this.input.state('right')) {
                this.vel.x = this.speed;
                this.anim = 'right';
            } else if (this.input.state('left')) {
                this.vel.x = -this.speed;
                this.anim = 'left';
            } else
                this.vel.x = 0;

            if (this.vel.x == 0 && this.vel.y == 0)
                this.anim = 'idle';
        }
    });
});
