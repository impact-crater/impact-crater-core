module.exports = function(socket) {
    socket.latency = new Latency(socket);
};

var Latency = function(socket) {
    this.stack = [];
    this.window = 20;
    this.interval = 1000;
    this.lastSentAt = null;
    this.avg = 0;
    this.last = 0;
    this.socket = socket;

    this.socket.on('pong', this.pong.bind(this));
    // Initiate latency monitoring
    this.ping();
};

Latency.prototype.ping = function() {
    this.lastSentAt = Date.now();
    this.socket.emit('ping');
};

Latency.prototype.pong = function() {
    this.last = parseInt((Date.now() - this.lastSentAt) / 2);
    this.stack.unshift(this.last);

    if (this.stack.length > this.window) 
        this.stack.pop();

    // Find the average
    var total = 0;
    this.stack.forEach(function(val) {
        total += val;
    });

    this.avg = parseInt(total / this.stack.length);

    // Send the client their latency
    this.socket.emit('latency', { avg: this.avg, last: this.last });

    // Queue up the next request
    setTimeout(this.ping.bind(this), this.interval);
};
