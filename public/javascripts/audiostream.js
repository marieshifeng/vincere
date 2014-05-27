
var chatid = parseInt(Math.random()*1e4,10).toString(16);
var localStream = null;

navigator.getUserMedia = (navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

if(navigator.getUserMedia) navigator.getUserMedia({video: false, audio: true}, successCallback, errorCallback);
else console.log("getUserMedia not supported by this browser.");

var socket = io.connect('/', {query: "user=" + chatid});
window.location.hash = (window.location.hash || parseInt(Math.random()*1e4,10).toString(16));

//our own PeerServer cloud API key
var peer = new Peer(chatid, {key: 'ejpl0jusq1gaatt9'});
// peer.on('open', function(id) {
// 	console.log("My peer ID is: " + id);
// });

function successCallback(stream) {
	$("#muteButton").show();
	localStream = stream;
	socket.emit('user:connecting', chatid);

	socket.on('user:connecting', function(userchatid) {
		console.log("User " + userchatid +  " joining chat room and getting called");

		var call = peer.call(userchatid, localStream);
		console.log("1. what is localstream: " + localStream);
			//console.log("1a. what is remotestream: " + remoteStream);
		call.on('stream', function(remoteStream) {
			console.log("1b. what is remotestream: " + remoteStream);
			//Received peer's MediaStrea.

			var remoteaudio = document.getElementById("remoteaudio");
			console.log("Received stream: " + remoteStream);

			try {
	          remoteaudio.src = window.URL.createObjectURL(remoteStream);
	          remoteaudio.play();
	        } catch(e) {
	          console.log("Error setting audio src: ", e);
	        }
		});
	});


	peer.on('call', function(call) { 
		console.log("Received call");
		call.answer(localStream);
			console.log("2. what is localstream: " + localStream);
			//console.log("2a. what is remotestream: " + remoteStream);
		call.on('stream', function(remoteStream) {
					console.log("2b. what is remotestream: " + remoteStream);
			var remoteaudio = document.getElementById("remoteaudio");
			console.log("Received stream: " + remoteStream);
			try {
		      remoteaudio.src = window.URL.createObjectURL(remoteStream);
		       remoteaudio.play();
		    } catch(e) {
		      console.log("Error setting audio src: " + e);
		    }
		});

	});
}

function errorCallback(error) {
	console.error('An error occurred getting local audio stream: [CODE ' + error.code + ']');
	return;
}

function muteAudio() {
	if(localStream) {
		$("#muteButton").hide();
		$("#unmuteButton").show();
		localStream.getAudioTracks()[0].enabled = false;
	}
}

function unmuteAudio() {
	if(localStream) {
	  $("#unmuteButton").hide();
	  $("#muteButton").show();
	  localStream.getAudioTracks()[0].enabled = true;
	}
}




