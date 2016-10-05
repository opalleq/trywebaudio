var initPlayer = function(player) {
	player.ctxt = new window.AudioContext();

	player.source = player.ctxt.createBufferSource();

	player.gainNode = player.ctxt.createGain();

	player.analyser = player.ctxt.createAnalyser();
};

var player = {
	source: null,

	currentTime: 0,

	gainNode: null,

	ctxt: null,

	start: function() {
		this.source.start(this.currentTime);
	},

	pause: function() {
		this.ctxt.suspend();
	},

	resume: function() {
		this.ctxt.resume();
	},

	stop: function() {
		this.currentTime = this.ctxt.currentTime;

		this.source.stop();
	},

	setVolume: function(volumeLevel) {
		if( volumeLevel < 0 ) {
			console.warn('Can not set negative volume level');

			return;
		}

		this.gainNode.gain.value = volumeLevel / 100;
	},

	analyse: function() {
		player.analyser.smoothingTimeConstant = 0.3;

		player.analyser.fftSize = 512;

		draw();
	}
};

initPlayer(player);

var loadFile = function(url) {
	var xhr = new XMLHttpRequest();

	xhr.open('GET', url, true);

	xhr.responseType = 'arraybuffer';

	xhr.onload = function() {
		player.ctxt.decodeAudioData(this.response)
				.then(function(decodedData) {
					getDuration(decodedData);

					play(decodedData);

					player.analyse();

				}, function(e) {
					console.error('Error decoding file: ', e);
				});
	};

	xhr.send();
};

// Load file

loadFile('apparat_fractales.mp3');

var play = function(decodedData) {
	player.source.buffer = decodedData;

	// Set connections

	player.source.connect(player.gainNode);

	player.source.connect(player.analyser);

	player.gainNode.connect(player.ctxt.destination);

	// No-repeat

	player.source.loop = false;

	// Start playback

	player.start(0);

	// Handlers settings

	player.setVolume(document.getElementById('player-volume').value);

	document.getElementById('play').style.display = "none";

	document.getElementById('pause').style.display = "inline-block";
};

var stop = function() {
	player.stop();
};

var getDuration = function(decodedData) {
	var minutes = Math.floor(decodedData.duration / 60);

	var seconds = ((decodedData.duration % 60)).toFixed(0);

	seconds = seconds > 9 ? seconds: "0" + seconds;

	document.getElementById("duration").innerHTML = minutes + ':' + seconds;
};

// Handlers

document.getElementById('play').addEventListener('click', function() {
	player.resume();

	document.getElementById('pause').style.display = "inline-block";

	this.style.display = "none";
});

document.getElementById('pause').addEventListener('click', function() {
	player.pause();

	document.getElementById('play').style.display = "inline-block";

	this.style.display = "none";
});

document.getElementById('stop').addEventListener('click', function() {
	player.stop();

	document.getElementById('pause').style.display = "none";

	document.getElementById('play').style.display = "inline-block";
});

document.getElementById('player-volume').addEventListener('input', function() {
	player.setVolume(this.value);
});

var canvas = document.createElement('canvas');

canvas.width = 600;

canvas.height = 200;

document.getElementById('widget-wrapper').appendChild(canvas);

var canvasCtx = canvas.getContext('2d');

canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

function draw() {
	var bufferLength = player.analyser.frequencyBinCount;

	var dataArray = new Float32Array(bufferLength);

	player.analyser.getFloatFrequencyData(dataArray);

	canvasCtx.fillStyle = 'rgb(0, 0, 0)';

	canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

	var barWidth = 10, barHeight, x = 0;

	for(var i = 0; i < bufferLength; i++) {
		barHeight = (dataArray[i] + 100) * 3;

		canvasCtx.fillStyle = 'rgb(30,' + Math.floor(barHeight) + ',140)';

		canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

		x += barWidth + 1;
	}

	requestAnimationFrame(draw);
}