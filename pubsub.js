'use strict'
var EventEmitter = require('events');
var net = require('net');

class Events extends EventEmitter {};

var channel = new Events();

channel.clients = {};
channel.subscriptions = {};

channel.on('join', function(id, client) { // event listener
    this.clients[id] = client;  // stores a users client object
    console.log("Somebody joined: " + id);
    this.subscriptions[id] = function(senderId, message) {
        if (id != senderId) {
            this.clients[id].write(message);
        }
    }
    this.on('broadcast', this.subscriptions[id]); // add a listener specific to current user
});

channel.on('shutdown', function() {
    channel.emit('broadcast', '', 'Chat has shut down.\n');
    channel.removeAllListeners('broadcast');
});
channel.on('error', function(err) {
    console.log("Error: " + err.message);
});
var server = net.createServer(function(client) {
    var id = client.remoteAddress + ':' + client.remotePort;
    console.log("Client entered: " + client.remoteAddress);
    channel.emit('join', id, client); // emit a join event when user connects
    client.on('data', function(data) {
        data = data.toString();
        console.log("id = " + id);
        if (data == 'shutdown\r\n') {
            console.log("Shutdown sent");
            channel.emit('shutdown');
        }
        channel.emit('broadcast', id, data);
    });
    client.on('error', function(err) {
        console.log('ERROR: ' + err.message);
    });
    client.on('close', function() {
        channel.emit('shutdown', id);
    });
});

//module.exports = {server, channel};
var port = 3000;
server.listen( {
    port: 3000,
    host: 'localhost'
    }, 
    () => {
    let address = server.address();
    console.log("opened server on %j", address);
 });
