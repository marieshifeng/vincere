var appClass = 'appMessage';
var friendClass = 'friendMessage';
var myClass = 'myMessage';

console.log("Story: " + story);

var myAuthor = 'Me';
var friendAuthor = "Friend";

var firstMessage = null;
var secondMessage = null;

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

var socket = io.connect('/', {query: "story=" + story});

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
			addMessage("Connection enabled", undefined, myClass);
			enableChatInput();
			textArea.scrollTop(textArea[0].scrollHeight);
			conn.send("Connection enabled!");
		});

		conn.on('data', function(message) {
			console.log("Received message! " + message);
			addMessage(message, friendAuthor, friendClass);
			textArea.scrollTop(textArea[0].scrollHeight);
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
			addMessage(message, friendAuthor, friendClass);
			enableChatInput();
			textArea.scrollTop(textArea[0].scrollHeight);
		});
	});
}

//first user in chat
socket.on('firstuserjoining', function() {
	firstMessage = "You’re the first person here. We’re working on finding another survivor to join you.";
	console.log(firstMessage);
	if(textArea != null) {
		addMessage(firstMessage, undefined, appClass);
		firstMessage = null;
	}
});

socket.on('seconduserjoined', function(otherStory) {
	anotherPersonInChat = true;
	var message = "Someone else has joined you!";
	addMessage(message, undefined, appClass);
	textArea.scrollTop(textArea[0].scrollHeight);

	$("#friend_story_text").text(otherStory);
	$("#friend_story").show();

});

//second user in chat
socket.on('seconduserjoining', function(otherStory) {
	anotherPersonInChat = true;
	secondMessage = "The other survivor is here.";
	if(textArea != null) {
		addMessage(secondMessage, undefined, appClass);
		secondMessage = null;
	}

	$("#friend_story_text").text(otherStory);
	$("#friend_story").show();
});


socket.on('user:disconnecting', function() {
	otherPersonLeft = true;
	var message = "The other survivor has left. If you want a copy of your drawing, be sure to save it!";
	addMessage(message, undefined, appClass);
	textArea.scrollTop(textArea[0].scrollHeight);
});


function enableChatInput() {
	$("#send_button").show();
	$("#message_input").show();
	$("div#chat_box").removeClass("chat_hover");
	//e.stopPropagation();
}

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
			addMessage(message, myAuthor, myClass);
			textArea.scrollTop(textArea[0].scrollHeight);
			conn.send(message);
			// Reset the message input box.
	        messageInput.value = "";
	        messageInput.focus();
		}
	} else {
		//put that there is no connection in chat box
		var errorMessage;
		if(!anotherPersonInChat) {
			errorMessage = "We can't send your message because no one else has joined yet.";
		} else if (!yourVoiceEnabled) {
			errorMessage = "We can't send your message because you haven't enabled your audio yet. Don't worry, you can mute it later if you'd like.";
		} else if (!otherVoiceEnabled) {
			errorMessage = "We can't send your message because the other person hasn't enabled their audio yet.";
		} else if (otherPersonLeft) {
			errorMessage = "We can't send your message because the other person has left the conversation.";
		}
		addMessage(errorMessage, undefined, appClass);
		textArea.scrollTop(textArea[0].scrollHeight);
		console.log("No connection - can't send.");
	}

	//prevent page from auto-refreshing
	event.preventDefault();
	return false;
}

window.onload = function() {
	textArea = $("#chat_box");	
	console.log("Document ready");

	messageForm = document.getElementById("message_form");
	messageForm.onsubmit = onSendMessage;
	//var greeting1 = "Welcome to your personal safe space!";
	//var greeting2 = "You’ll get to know another survivor of sexual assault today. We encourage you to share the stories of your assault experiences, as it can be therapeutic to share - but it’s totally up to you what you actually talk about.";
	//var greeting3 = "While you talk, have some fun by doodling in the shared drawing space. Just pick a color, set the opacity, and get started.";
	//var greeting4 = "Quick reminder: don’t forget to allow the site to access your microphone, so you can talk to each other.";
	var greeting6 = "Your chat will be enabled once you're both here with enabled microphones.";
	addMessage(greeting6, undefined, appClass);
	//addMessage(greeting1, undefined, appClass);
	//addMessage(greeting2, undefined, appClass);
	//addMessage(greeting3, undefined, appClass);
	//addMessage(greeting4, undefined, appClass);

	if(firstMessage != null) {
		addMessage(firstMessage, undefined, appClass);
	}

	if(secondMessage != null) {
		addMessage(secondMessage, undefined, appClass);
		textArea.scrollTop(textArea[0].scrollHeight);
	}
}

 /**
 * Add message to the chat window
 */
function addMessage(message, author, authorClass) {
	if(author) {
    	textArea.append('<p><span class="' + authorClass + '">' + author + '</span>' + ': ' + message + '</p>');
    } else {
    	textArea.append('<p><span class="' + authorClass + '">' + message + '</span>' + '</p>' + '<br>');
    }
}


