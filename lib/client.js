
function Client(socket, server){
	var self = this;

	self.socket = socket;
	self.server = server;
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
	}

};

Client.prototype._conn_end = function(data){
	console.log('disconnected');
};

Client.prototype._send_error_response = function(code){
	var self = this,
		err_response = {
			code: code,
			msg: self.codes[code],
			data: {}
		};


	try {
		self.socket.write(JSON.stringify(err_response) + "\r\n");
	} catch(err){
		console.log(err);
	}
};

Client.prototype._send_response = function(){

}



exports.Client = Client;
