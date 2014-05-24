
//our own PeerServer cloud API key
//var peer = new Peer('abc', {key: 'ejpl0jusq1gaatt9'});

var session = Peer.initSession().addMedia('myvideo').connect(window.location.hash).on('media', function(e){
		document.querySelector('div.demo').appendChild(e.video);
	});

// navigator.webkitGetUserMedia({video: false, audio: true}, successCallback, errorCallback);
// function successCallback(stream) {
// 	var session = Peer.initSession();
// 	// .addMedia('remote_audio').connect(window.location.hash).on('media', function(e){
// 	// 	document.querySelector('remote_audio').appendChild(e.audio);
// 	// });
// }
// function errorCallback(error) {
// 	console.error('An error occurred getting local audio stream: [CODE ' + error.code + ']');
// 	return;
// }

// var link = document.getElementById('chatroom_link');
// link.innerHTML = window.location.href;
// link.href = window.location.href;


