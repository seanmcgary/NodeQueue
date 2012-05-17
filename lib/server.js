var net = require('net'),
	utils = require('./utils.js').utils,
	Client = require('./client.js').Client,
	Channel = require('./channel.js').Channel;

function Server(port){
	var self = this;

	if(typeof port === 'undefined'){
		port = 9090;
	}

	self.port = port;
	self.client_list = {};
	self.channels = {};


	self.server = net.createServer(function(socket){
		var client_id = self.gen_client_id();	

		self.client_list[client_id] = new Client(socket, client_id, self);
		

	});

	self.server.listen(self.port, function(){
		console.log('listening on port ' + self.port);
	});

}

Server.prototype.gen_client_id = function(){
	var self = this,
		id = utils.get_time();
	
	while(id in self.client_list){
		id = utils.get_time();
	}

	return id;
}

Server.prototype.remove_consumer = function(consumer_id){
	var self = this;

	// remove the consumer from the list
};

Server.prototype.create_channel = function(name){
	var self = this;

	if(self.channel_exists(name) === false){
		self.channels[name] = new Channel(name);
	}
};

Server.prototype.channel_exists = function(channel_name){
	var self = this;

	if(channel_name in self.channels){
		return true;
	} else {
		return false;
	}
};

exports.Server = Server;
