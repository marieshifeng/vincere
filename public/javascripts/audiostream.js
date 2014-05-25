
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

tool.minDistance = 10;
tool.maxDistance = 45;


// Random User ID
// Used when sending data
var uid =  (function() {
     var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
} () );




// JSON data ofthe users current drawing
// Is sent to the user
var path_to_send = {};

// Calculates colors
var active_color_rgb;
var active_color_json = {};
var $opacity = $('#opacity');
var update_active_color = function() {

    var rgb_array =  $('.active').attr('data-color').split(',');
    var red = rgb_array[0] / 255;
    var green = rgb_array[1] / 255;
    var blue = rgb_array[2] / 255;
    var opacity =  $opacity.val() / 255;

    active_color_rgb =  new RgbColor( red, green, blue, opacity );
    active_color_rgb._alpha = opacity;

    active_color_json = {
        "red" : red,
        "green" : green,
        "blue" : blue,
        "opacity" : opacity
    };

};


// Get the active color from the UI eleements
update_active_color();


// --------------------------------- 
// DRAWING EVENTS


var send_paths_timer;
var timer_is_active = false;

function onMouseDown(event) {

    console.log("User mouse down - drawing");

    var point = event.point;

    path = new Path();
    path.fillColor = active_color_rgb;
    path.add(event.point);

    // The data we will send every 100ms on mouse drag
    console.log("Color:" + active_color_rgb);

    path_to_send = {
        rgba : active_color_json,
        start : event.point,
        path : []
    };


}

function onMouseDrag(event) {
    
    var step = event.delta / 2;
    step.angle += 90;
    
    var top = event.middlePoint + step;
    var bottom = event.middlePoint - step;
    
    path.add(top);
    path.insert(0, bottom);
    path.smooth();

    // Add data to path
    path_to_send.path.push({
        top : top,
        bottom : bottom
    });

    // Send paths every 100ms
    if ( !timer_is_active ) {

        send_paths_timer = setInterval( function() {

            socket.emit('draw:progress', uid, JSON.stringify(path_to_send) );
            path_to_send.path = new Array();

        }, 100);

    }

    timer_is_active = true;

}


function onMouseUp(event) {

     console.log("User mouse up - sending");
   
    // Close the users path
    path.add(event.point);
    path.closed = true;
    path.smooth();

    // Send the path to other users
    path_to_send.end = event.point;
    socket.emit('draw:end', uid, JSON.stringify(path_to_send) );

    // Stop new path data being added & sent
    clearInterval(send_paths_timer);
    path_to_send.path = new Array();
    timer_is_active = false;

}


// --------------------------------- 
// CONTROLS EVENTS

var $color = $('.color');
$color.on('click', function() {

    $color.removeClass('active');
    $(this).addClass('active');

    update_active_color();

});

$opacity.on('change', function() {

    update_active_color();

});


// --------------------------------- 
// SOCKET.IO EVENTS


socket.on('draw:progress', function( artist, data ) {

    // It wasnt this user who created the event
    if ( artist !== uid && data ) {

       progress_external_path( JSON.parse( data ), artist );

    }

}); 

socket.on('draw:end', function( artist, data ) {

    // It wasn't this user who created the event
    if ( artist !== uid && data ) {
       end_external_path( JSON.parse( data ), artist );
    }

}); 


var external_paths = {};

// Ends a path
var end_external_path = function( points, artist ) {

    var path = external_paths[artist];

    if ( path ) {

        // Close the path
        path.add(points.end);
        path.closed = true;
        path.smooth();

        // Remove the old data
        external_paths[artist] = false;

    }

};

// Continues to draw a path in real time
progress_external_path = function( points, artist ) {


    var path = external_paths[artist];

    // The path hasnt already been started
    // So start it
    if ( !path ) {

        // Creates the path in an easy to access way
        external_paths[artist] = new Path();
        path = external_paths[artist];

        // Starts the path
        var start_point = new Point(points.start.x, points.start.y);
        var color = new RgbColor( points.rgba.red, points.rgba.green, points.rgba.blue, points.rgba.opacity );
        path.fillColor = color;
        path.add(start_point);

    }

    // Draw all the points along the length of the path
    var paths = points.path;
    var length = paths.length;
    for (var i = 0; i < length; i++ ) {

        path.add(paths[i].top);
        path.insert(0, paths[i].bottom);

    }

    path.smooth();


    view.draw();



};

function saveImage() {
  socket.emit("in function");
  getCanvas.view.draw();
  getCanvas.view.element.toBlob(function(blob) { 
    socket.emit("created image");
    saveAs(blob, "image.png");
  });
}


