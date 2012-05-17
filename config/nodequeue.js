exports.commands = {
	use: 0,
	push: 1,
	watch: 2,
	ignore: 3,
	reserve: 4,
	pop: 5,
	delete: 6,
	peek: 7,
	stat: 8,
	server_stat: 9,
	delete_channel: 10,
	clear_channel: 11,
	stop_use: 12,
	broadcase: 13,
	channel_queue: 14
};

exports.codes = {
	// 1xx - error codes
	"100": "ERR 100 Malformed JSON request",
	"101": "ERR 101 Channel doesn't exist",
	"102": "ERR Queue is empty",
	"103": "ERR Message for msg_id not in queue"

	// 2xx - success response
	"200": "OK Subscribed to channel",
	"201": "OK Pushed message to channel",
	"202": "OK Channel updated",
	"203": "OK Message reserved",
	"204": "OK Watching channel",
	"205": "OK Message popped",
	"206": "OK Message peeked",
	"207": "OK Cleared channel",
	"208": "OK Channel deleted",
	"209": "OK Server stat"
};

exports.msg_states = {
	ready: 0,
	reserved: 1
};
