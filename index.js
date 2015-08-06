var Twitter = require('twitter');
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
var nconf = require('nconf');

nconf.argv()
	.env()
	.file({
		file: './config.json'
	});
nconf.load();

var streamName = nconf.get('kinesis_stream');
var twitterClient = new Twitter(nconf.get('twitter_keys'));
AWS.config.update({
	region: nconf.get('region')
});

var kinesis = new AWS.Kinesis();

twitterClient.stream('statuses/filter', {
	locations: "-180,-90,180,90"
}, function(stream) {
	stream.on('data', function(tweet) {
		var params = {
			Data: JSON.stringify(tweet),
			PartitionKey: uuid.v4(),
			StreamName: streamName
		};
		kinesis.putRecord(params, function(err, data) {
			if (err) console.log(err, err.stack);
			else console.log(data);
		});
	});

	stream.on('error', function(error) {
		console.error(error);
	});
});
