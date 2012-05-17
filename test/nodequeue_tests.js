var vows = require('vows'),
	assert = require('assert'),
	spawn = require('child_process').spawn,
	net = require('net'),
	server = require('../lib/server.js').Server;

var socket = null;

exports.canConnect = vows.describe('canConnect').addBatch({
	'server setup': {
		topic: function(){
			// start server
			new server();
			this.callback(null);
		},
		'make client connection':{
			topic: function(err, data){
				var cb = this.callback;
				
				socket = net.createConnection(9090, 'localhost');

				socket.on('connect', function(){
					cb(null);
				});

				socket.on('error', function(){
					cb(false);
				});

			},
			'client did connect': function(err){
				assert.equal(err, null); 
			},
			'use channel': {
				topic: function(){
					var cb = this.callback;
					socket.on('data', function(data){
						cb(null, data.toString());
					});
					
					socket.write("foobar");
					
				},
				'use channel response success': function(err, data){
					var json = JSON.parse(data.substr(0, data.length - 2));

					assert.include(json, 'code');
					assert.include(json, 'msg');
					assert.include(json, 'data');
					assert.equal(json.code, 100);

				}
			}
		}
	}
});
