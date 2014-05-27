// Express requires these dependencies
var express = require('express')
  , session = require ('express-session')
  , routes = require('./routes')
  , user = require('./routes/user')
  , contract = require('./routes/contract')
  , connect = require('./routes/connect')
  , audio = require('./routes/audio')
  , chatroom = require('./routes/chatroom')
  , resources = require('./routes/resources')
  , about = require('./routes/about')
  , http = require('http')
  , socket = require('socket.io')
  , path = require('path');

var app = express();

// Configure our application
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.favicon());
  var store = new express.session.MemoryStore;
  app.use(express.session({secret: "SECRET", store: store}));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Configure error handling
app.configure('development', function(){
  app.use(express.errorHandler());
});

// Setup Routes
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/contract', contract.view);
app.get('/connect', connect.view);
app.get('/audio', audio.view);
app.get('/resources', resources.view);
app.get('/about', about.view);
app.get('/chatroom/getUrl', chatroom.getUrl);
app.post('/chatroom/setUrl', chatroom.setUrl);

// Enable Socket.io

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// A user connects to the server (opens a socket)
// var active_connections = 0;
var active_room = null;
var active_room_num = 0;
var io = socket.listen(server);
io.sockets.on('connection', function (socket) {
  var user = socket.manager.handshaken[socket.id].query.user;
  if(active_room == null) {
    active_room_num++;
    active_room = "room" + active_room_num;
    socket.room = active_room;
    socket.join(active_room);
    console.log("User " + user + " joining new room: " + active_room);
    //tell them they're the first user in chat room
    io.sockets.socket(socket.id).emit('firstuserjoining');
  } else {
    socket.room = active_room;
    socket.join(active_room);
    console.log("User " + user + " joining old room: " + active_room);
    active_room = null;
    //tell them they're the second user in chat room
    io.sockets.socket(socket.id).emit('seconduserjoining');
    //tell other person another user's joined
    socket.broadcast.to(socket.room).emit('seconduserjoined');
  }

  socket.on('user:connecting', function(user) {
    console.log("User connecting: " + user);
    socket.broadcast.to(socket.room).emit('user:connecting', user);
  }); 
    

  // (2): The server recieves a ping event
  // from the browser on this socket
 
  // socket.on( 'drawCircle', function( data, session ) {
  //   console.log( "session " + session + " drew:");
  //   console.log( data );
  //   socket.broadcast.emit( 'drawCircle', data );
  // });

    // active_connections++;
    // console.log("Active connections: " + active_connections);
  
    socket.on('disconnect', function () {
      console.log("Disconnecting");
      socket.broadcast.to(socket.room).emit('user:disconnecting');
     // active_connections--;
    });
    // EVENT: User starts drawing something
    socket.on('draw:progress', function (uid, co_ordinates) {  
      io.sockets.in(socket.room).emit('draw:progress', uid, co_ordinates)
    });
    // EVENT: User stops drawing something
    socket.on('draw:end', function (uid, co_ordinates) { 
      io.sockets.in(socket.room).emit('draw:end', uid, co_ordinates)
    });
  });