
var chatid = parseInt(Math.random()*1e4,10).toString(16);
var localStream = null;
var messageForm = null;
var textArea = null;
var otherVoiceEnabled = false;
var yourVoiceEnabled = false;
var anotherPersonInChat = false;
var otherPersonLeft = false;

navigator.getUserMedia = (navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

if(navigator.getUserMedia) navigator.getUserMedia({video: false, audio: true}, successCallback, errorCallback);
else console.log("getUserMedia not supported by this browser.");

var socket = io.connect('/', {query: "user=" + chatid});

//our own PeerServer cloud API key
var peer = new Peer(chatid, {key: 'ejpl0jusq1gaatt9'});
// peer.on('open', function(id) {
// 	console.log("My peer ID is: " + id);
// });

var conn = null;

function successCallback(stream) {
	yourVoiceEnabled = true;
	$("#muteButton").show();
	localStream = stream;
	socket.emit('user:connecting', chatid);

	socket.on('user:connecting', function(userchatid) {
		otherVoiceEnabled = true;
		console.log("User " + userchatid +  " joining chat room and getting called");

		//connecting for audio
		var call = peer.call(userchatid, localStream);
		console.log("1. what is localstream: " + localStream);
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

		//connecting for data (chatbox messaging)
		conn = peer.connect(userchatid);
		conn.on('open', function() {
			textArea.value = textArea.value + "\n" + "Me: Connection enabled!";
		textArea.scrollTop = textArea.scrollHeight;
			conn.send("Connection enabled!");
		});

		conn.on('data', function(message) {
			console.log("Received message! " + message);
			textArea.value = textArea.value + "\n" + "Friend: " + message;
			textArea.scrollTop = textArea.scrollHeight;
		});
	});


	peer.on('call', function(call) { 
		console.log("User " + chatid + "received call");
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

	peer.on('connection', function(remoteconn) {
		conn = remoteconn;
		console.log("User " + chatid + " received data connection");

		conn.on("data", function(message) {
			console.log("Received message! " + message);
			textArea.value = textArea.value + "\n" + "Friend: " + message;
			textArea.scrollTop = textArea.scrollHeight;
		});
	});
}

//first user in chat
socket.on('firstuserjoining', function() {
	textArea.value = textArea.value + "\n" + "Thanks for coming! You’re the first person here. We’re working on finding another survivor to join you.\n";
});

socket.on('seconduserjoined', function() {
	anotherPersonInChat = true;
	textArea.value = textArea.value + "\n" + "Someone else has joined you! Make sure your audio is enabled so you can say hi, and start sharing whenever you’re ready.\n";
	textArea.scrollTop = textArea.scrollHeight;
});

//second user in chat
socket.on('seconduserjoining', function() {
	anotherPersonInChat = true;
	textArea.value = textArea.value + "\n" + "Thanks for coming! The other survivor is already here, so say hi, and start sharing whenever you’re ready.\n";
});


socket.on('user:disconnecting', function() {
	otherPersonLeft = true;
	textArea.value = textArea.value + "\n" + "The other survivor has left. If you want a copy of your drawing, be sure to save it!";
	textArea.scrollTop = textArea.scrollHeight;
});

function errorCallback(error) {
	console.error('An error occurred getting local audio stream: [CODE ' + error.code + ']');
	return;
}

function muteAudio() {
	if(localStream) {
		console.log("Muting audio.");
		$("#muteButton").hide();
		$("#unmuteButton").show();
		localStream.getAudioTracks()[0].enabled = false;
	}
}

function unmuteAudio() {
	if(localStream) {
	  console.log("Unmuting audio.");
	  $("#unmuteButton").hide();
	  $("#muteButton").show();
	  localStream.getAudioTracks()[0].enabled = true;
	}
}

function onSendMessage(event) {
	if(conn != null) {
		console.log("Sending message");
		var messageInput = document.getElementById("message_input");
		var message = messageInput.value;
		if(message != "") {
			textArea.value = textArea.value + "\n" + "Me: " + message;
			textArea.scrollTop = textArea.scrollHeight;
			conn.send(message);
			// Reset the message input box.
	        messageInput.value = "";
	        messageInput.focus();
		}
	} else {
		//put that there is no connection in chat box
		if(!anotherPersonInChat) {
			textArea.value = textArea.value + "\n" + "We can't send your message because no one else has joined yet. We're still looking!\n";
		} else if (!yourVoiceEnabled) {
			textArea.value = textArea.value + "\n" + "We can't send your message because you haven't enabled your audio yet. Don't worry, you can mute it later if you'd like.\n";
		} else if (!otherVoiceEnabled) {
			textArea.value = textArea.value + "\n" + "We can't send your message because the other person hasn't enabled their audio yet. They know you're here, so just give them a minute!\n";
		} else if (otherPersonLeft) {
			textArea.value = textArea.value + "\n" + "We can't send your message because the other person has left the conversation. Join again if you'd like to talk to someone else!\n";
		}
		textArea.scrollTop = textArea.scrollHeight;
		console.log("No connection - can't send.");
	}

	//prevent page from auto-refreshing
	event.preventDefault();
	return false;
}

window.onload = function() {
	console.log("Document ready");
	messageForm = document.getElementById("message_form");
	messageForm.onsubmit = onSendMessage;
	textArea = document.getElementById("chat_box");
	textArea.value = "Welcome to your personal safe space! \n \nYou’ll get to know another survivor of sexual assault today. We encourage you to share the stories of your assault experiences, as it can be therapeutic to share - but it’s totally up to you what you actually talk about.\n \nWhile you talk, have some fun by doodling in the shared drawing space. Just pick a color, set the opacity, and get started.\n \nQuick reminder: don’t forget to allow the site to access your microphone, so you can talk to each other.\n";
}



