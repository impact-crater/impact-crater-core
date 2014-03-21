ig.module('game.entities.drone')
.requires(
    'plugins.client'
)
.defines(function() {

    EntityDrone = EntityClient.extend({
        animSheet: new ig.AnimationSheet('media/tiles.gif', 32, 32),
        init: function(x, y, settings) {
            this.parent(x, y, settings);

            this.addAnim('only', 0.03, [9]);
            this.currentAnim = this.anims.only;

        }
    });

});
