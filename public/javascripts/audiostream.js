
var chatid = parseInt(Math.random()*1e4,10).toString(16);
var socket = io.connect('/', {query: "user=" + chatid});
var localStream = null;
navigator.webkitGetUserMedia({video: false, audio: true}, successCallback, errorCallback);


//our own PeerServer cloud API key
var peer = new Peer(chatid, {key: 'ejpl0jusq1gaatt9'});

// peer.on('open', function(id) {
// 	console.log("My peer ID is: " + id);
// });

function successCallback(stream) {
	localStream = stream;
}

function errorCallback(error) {
	console.error('An error occurred getting local audio stream: [CODE ' + error.code + ']');
	return;
}

function muteAudio() {
	$("#muteButton").hide();
	$("#unmuteButton").show();

	localStream.stop();
	localStream = null;
}

function unmuteAudio() {

  $("#unmuteButton").hide();
  $("#muteButton").show();

  if(localStream == null) navigator.webkitGetUserMedia({video: false, audio: true}, successCallback, errorCallback);

}

socket.on('user:connecting', function(userchatid) {
	console.log("User " + userchatid +  " joining chat room and getting called");
	var call = peer.call(userchatid, localStream);
	call.on('stream', function(remoteStream) {
		//Received peer's MediaStrea.

		console.log("Received stream: " + remoteStream);
		var remoteaudio = document.getElementById("remoteaudio");
		try {
          remoteaudio.src = window.URL.createObjectURL(remoteStream);
          remoteaudio.play();
        } catch(e) {
          console.log("Error setting audio src: ", e);
        }
	});
});


peer.on('call', function(call) { 

	call.answer(localStream);
	call.on('stream', function(remoteStream) {
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



