// Express requires these dependencies
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , contract = require('./routes/contract')
  , connect = require('./routes/connect')
  , audio = require('./routes/audio')
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
  app.use(express.favicon());
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

// Enable Socket.io

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// A user connects to the server (opens a socket)
// var active_connections = 0;
var io = socket.listen(server);
io.sockets.on('connection', function (socket) {
  var user = socket.manager.handshaken[socket.id].query.user;
  console.log("User connecting: " + user);

  socket.broadcast.emit('user:connecting', user);

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
      io.sockets.emit('user:disconnect');
     // active_connections--;
    });
    // EVENT: User starts drawing something
    socket.on('draw:progress', function (uid, co_ordinates) {  
      io.sockets.emit('draw:progress', uid, co_ordinates)
    });
    // EVENT: User stops drawing something
    socket.on('draw:end', function (uid, co_ordinates) { 
      io.sockets.emit('draw:end', uid, co_ordinates)
    });
  });