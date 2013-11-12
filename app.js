var program = require('commander');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');

program
  .version('0.0.2')
  .option('-k, --key [value]', 'API key')
  .option('-h, --host [value]', 'Hostname (e.g. dev.twinpay.eu)')
  .option('-d, --dir [value]', 'Full path for update CSV\'s')
  .parse(process.argv);

if(!program.key) {
	console.log("You must specify a API key, see --help");
	process.exit(1);
}
if(!program.host) {
	console.log("You must specify a HOST, see --help");
	process.exit(1);
}
if(!program.dir) {
	console.log("You must specify dir, see --help");
	process.exit(1);
}

var TwinpayUpdater = {
	init: function(program) {
		this.program = program;
		this.run();
	},
	checkForNewFiles: function() {
		var files = fs.readdirSync(this.program.dir);
		for(var index in files) {
			if(path.extname(files[index]).toLowerCase() == ".csv") {
				this.uploadFile(this.program.dir + path.sep + files[index]);
			}
		}
	},
	uploadFile: function(filename) {
		console.log("Found file: ", filename, "waiting 4 secs..");

		var stats = fs.statSync(filename);

		setTimeout(function() {
			var newStats = fs.statSync(filename);
			if(stats.size == newStats.size) {
				console.log("File did not change, uploading..");

				var newFilename = filename + ".uploading." + (new Date().getTime());

				fs.renameSync(filename, newFilename);

				var form = new FormData();

				form.append('key', this.program.key);
				form.append('uploadedfile', fs.createReadStream(newFilename));

				form.submit('http://' + this.program.host + "/api/import-csv", function(err, res) {
					if (err) throw err;
					res.on('data', function(chunk) {
						console.log("Server responded (it should not respond anything): " + chunk);
					});
					fs.renameSync(newFilename, newFilename + ".finished." + (new Date().getTime()));
					console.log("Server said", res.statusCode, "Renamed file");
				});
			}

		}.bind(this), 4000);
	},
	run: function() {
		var that = this;
		setInterval(function() {
			that.checkForNewFiles();
		}, 1000*10);
		this.checkForNewFiles();
	}
};

TwinpayUpdater.init(program);