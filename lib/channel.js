function Channel(name){
	var self = this;
	self.name = name;

	self._queue = [];
	self.client_list = {};
	self.utils = require('./utils.js').utils;
	self.states = require('../config/nodequeue.js').msg_states;
	self.watch_list = {};
	console.log(self.states);
}

Channel.prototype.add_client_to_channel = function(client){
	var self = this;

	self.client_list[client.client_id] = client;

};

Channel.prototype.add_client_to_watch_list = function(client){
	var self = this;

	self.watch_list[client.client_id] = client;
};

Channel.prototype.remove_client_from_channel = function(client_id){
	var self = this;

	if(client_id in self.client_list){
		delete client_list[client_id];
	}
};

Channel.prototype.remove_client_from_watch_list = function(client_id){
	var self = this;

	if(client_id in self.watch_list){
		delete watch_list[client_id];
	}
};

Channel.prototype.get_clients = function(){
	var self = this;

	return self.client_list;
};

Channel.prototype.push = function(msg){
	var self = this,
		msg_id = self.utils.get_time(),
		new_msg = {
			msg_id: msg_id,
			state: self.states.ready,
			msg: msg
		};

	self._queue.push(new_msg);

	self.broadcast_to_watchers(new_msg);
};

Channel.prototype.pop = function(){
	var self = this;

};

Channel.prototype.reserve = function(){
	var self = this;

	if(self._queue.length > 0){
		self._queue[0].state = self.states.reserved;
		return self._queue[0];
	} else {
		return null;
	}
};

Channel.prototype.delete = function(msg_id){
	var self = this;
};

Channel.prototype.peek = function(){
	
};

Channel.prototype.broadcast_to_watchers = function(msg){
	var self = this;

	for(var i in self.watch_list){
		self.watch_list[i]._send_response(202, {
			msg: msg
		});
	}
}



exports.Channel = Channel;

