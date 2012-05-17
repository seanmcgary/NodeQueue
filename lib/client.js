
function Client(socket, client_id, server){
	var self = this;

	self.socket = socket;
	self.server = server;
	self.client_id = client_id;
	self.subscribed_channels = [];
	self.commands = require('../config/nodequeue.js').commands;
	self.codes = require('../config/nodequeue.js').codes;
	
	self._setup_server_listeners();
}

Client.prototype._setup_server_listeners = function(){
	var self = this;

	self.socket.on('data', function(data){
		self._data_recv(data);

	});

	self.socket.on('end', function(){
		self._conn_end();
	});
};

Client.prototype._data_recv = function(data){
	var self = this;	
	data = data.toString();
	
	// remove any trailing CRLF
	for(var i = 0; i < 2; i++){
		if(data[data.length - 1] == "\r" || data[data.length - 1] == "\n"){
			data = data.substr(0, data.length - 1);
		}
	}
	
	try {
		data = JSON.parse(data);
	} catch (err){
		console.log('malformed json request');
		console.log(err);
		self._send_error_response(100);
		return;
	}

	switch(data.code){
		case self.commands.use:
			// use a channel

			// check to see if it exists
			if(!self.server.channel_exists(data.args.channel_name)){
				self.server.create_channel(data.args.channel_name);
			}
			
			// add user to channel
			self.server.channels[data.args.channel_name].add_client_to_channel(self);
			self._send_response(200);
			break;

		case self.commands.push:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			self.server.channels[data.args.channel_name].push(data.args.msg);
			self._send_response(201);
			break;
		case self.commands.broadcast:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			self.server.channels[data.args.channel_name].broadcast(data.args.msg);
			break;
		case self.commands.watch:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			self.server.channels[data.args.channel_name].add_client_to_watch_list(self);
			self._send_response(204);
			break;
		case self.commands.ignore:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			self.server.channels[data.args.channel_name].remove_client_from_watch_list(self.client_id);
			break;
		case self.commands.stop_use:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			self.server.channels[data.args.channel_name].remove_client_from_channel(self.client_id);
			break;
		case self.commands.reserve:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			var reserve_res = self.server.channels[data.args.channel_name].reserve();
			if(reserve_res !== null){
				self._send_response(203, {msg: reserve_res});
			} else {
				self._send_error_response(102);
			}

			break;

		case self.commands.pop:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			var popped_msg = self.server.channels[data.args.channel_name].pop();

			if(popped_msg !== null){
				self._send_response(205, {msg: popped_msg});
			} else {
				self._send_error_response(102);
			}

			break;
		case self.commands.delete:
			
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			var res = self.server.channels[data.args.channel_name].delete(data.args.msg_id);
			if(res.err !== true){
				self._send_response(207);
			} else {
				self._send_error_response(res.code);
			}

		case self.commands.peek:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}

			var peek_msg  = self.server.channels[data.args.channel_name].peek();

			if(peek_msg !== null){
				self._send_response(206, {msg: peek_msg});
			} else {
				self._send_error_response(102);
			}

			break;
		case self.commands.stat:
			var channels = data.args.channels;
			for(var i in channels){
				if(self.server.channel_exists(channels[i])){
					console.log(self.server.channels[channels[i]].name);
					var q = self.server.channels[channels[i]]._queue;
					for(var j in q){
						console.log("\t" + q[j]);
					}
				}
			}

			break;
		case self.commands.server_stat:
			// print out the connected clients
			console.log("Server clients: ");

			var server_stats = {
				connected_clients: [],
				channels: []
			};

			for(var i in self.server.client_list){
				//console.log("\t" + self.server.client_list[i].client_id + ": " + 
				//			self.server.client_list[i].socket.remoteAddress);

				server_stats.connected_clients.push({
					client_id: self.server.client_list[i].client_id,
					remote_address: self.server.client_list[i].socket.remoteAddress
				});
			}

			for(var i in self.server.channels){
				var channel = {
					channel_name: self.server.channels[i].channel_name,
					clients: [],
					queue_length: self.server.channels[i]._queue.length
				};
				var clients = self.server.channels[i].client_list;
				console.log(self.server.channels[i].name);
				for(var j in clients){
					//console.log("\t" + clients[j].client_id);
					channel.clients.push({
						client_id: clients[j].client_id,
						remote_address: clients[j].socket.remoteAddress
					});

					server_stats.channels.push(channel);
				}
			}

			self._send_response(209, {stats: server_stats});

			break;

		case self.commands.delete_channel:
			var delete_res = self.server.delete_channe(data.args.channel_name);

			if(delete_res.err !== true){
				self._send_response(208);
			} else {
				self._send_error_response(delete_res.code);
			}

			break;
			
		case self.commands.clear_channel:
			if(!self.server.channel_exists(data.args.channel_name)){
				self._send_error_response(200);
				break;
			}
			
			self.server.channels[data.args.channel_name].clear_channel();

			self._send_response(207);
			break;

	}

};

Client.prototype._conn_end = function(data){
	console.log('disconnected');
};

Client.prototype._send_error_response = function(code, data){
	var self = this;
	
	if(typeof data === 'undefined'){
		data = {};
	}	
	
	var err_response = {
		code: code,
		msg: self.codes[code],
		data: data
	};


	try {
		self.socket.write(JSON.stringify(err_response) + "\r\n");
	} catch(err){
		console.log(err);
	}
};

Client.prototype._send_response = function(code, data){
	var self = this;
		
	if(typeof data === 'undefined'){
		data = {};
	}

	var resp = {
		code: code,
		msg: self.codes[code],
		data: data
	};

	
	try {
		self.socket.write(JSON.stringify(resp) + "\r\n");
	} catch (err){
		console.log(err);
	}
}



exports.Client = Client;
