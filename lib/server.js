var net = require('net'),
	Client = require('./client.js').Client;

function Server(port){
	var self = this;

	if(typeof port === 'undefined'){
		port = 9090;
	}

	self.port = port;
	self.client_list = [];


	self.server = net.createServer(function(socket){
		console.log('client connected');
		
		self.client_list.push(new Client(socket, self));

	});

	self.server.listen(self.port, function(){
		console.log('listening on port ' + self.port);
	});

}

Server.prototype.remove_consumer = function(consumer_id){
	var self = this;

	// remove the consumer from the list
};

exports.Server = Server;
