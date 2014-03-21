ig.module('game.entities.player')
.requires(
    'plugins.client'
)
.defines(function() {
    EntityPlayer = EntityClient.extend({
        animSheet: new ig.AnimationSheet('media/player.png', 32, 32),
        init: function(x, y, settings) {
            this.parent(x, y, settings);

            // These are considered your actions and will be sent
            // to the server as action => 'up', 'left', etc.
            ig.input.bind(ig.KEY.W, 'up');
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.S, 'down');
            ig.input.bind(ig.KEY.D, 'right');

            var frameSpeed = 0.1;
            this.addAnim('idle',  frameSpeed, [1]);
            this.addAnim('left',  frameSpeed, [12, 13, 14]);
            this.addAnim('down',  frameSpeed, [0, 1, 2]);
            this.addAnim('right', frameSpeed, [24, 25, 26]);
            this.addAnim('up',    frameSpeed, [36, 37, 38]);

            this.currentAnim = this.anims.idle;
        },

        update: function() {
            this.parent();

            if (this.anim == 'up')
                this.currentAnim = this.anims.up;
            else if (this.anim == 'right')
                this.currentAnim = this.anims.right;
            else if (this.anim == 'down')
                this.currentAnim = this.anims.down;
            else if (this.anim == 'left')
                this.currentAnim = this.anims.left;
            else if (this.anim == 'idle')
                this.currentAnim = this.anims.idle;
            else
                this.currentAnim.rewind();

            // Center the screen on my entity.
            if (ig.client.getClientId() == this.owner) {
                ig.game.screen.x = this.pos.x - ig.system.width/2;
                ig.game.screen.y = this.pos.y - ig.system.height/2;
            }
        }
    });
});
