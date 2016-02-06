// run on server with:
// "forever start -a --spinSleepTime 10000 -l ~/own-this-website-personal/logs/forever_log.txt -o ~/own-this-website-personal/logs/nodemon_log.txt -e ~/own-this-website-personal/logs/error_log.txt /usr/local/bin/nodemon ~/own-this-website-personal/main.js --exitcrash"
var io = require('socket.io').listen(8000);

var newConnections = [];
var ipSpamChecker = {};
var socketSpamChecker = {};

var people = {
  marcia: {
    'key': 'marcia',
    'name': 'Marcia',
    'location': 'On the bus'
  },
  kalvin: {
    'key': 'kalvin',
    'name': 'Kalvin',
    'location': 'In a call'
  }
};

var officialScoreKeeper = setInterval(function() {
  var i = newConnections.length;

  // Start a synchronized timer for all the new connections
  while(i--) {
    newConnections.pop().emit('updatePeopleInitial', people);
  }

  // Clear the spam checker
  ipSpamChecker = {};
  socketSpamChecker = {};
}, 1000);


function changedStoredPerson(key, location) {
  var person = people[key];
  person.location = location;

  io.sockets.emit('updatePerson', person);
}

function addPerson(name, socket) {
  // Add the person to the people object
  people[name] = {
    // TODO(marcia): key should be something else, but can be name for now
    'key': name,
    'name': name
  };

  // Then set their location to some default
  setPerson(name, 'in the office', socket);
}

function setPerson(key, location, socket) {
  var score;
  var ipSpamCount = ipSpamChecker[socket.ipAddress];
  var socketSpamCount = socketSpamChecker[socket.id];

  // Check for spamming from a single socket (warning at > 3 / second)
  if(!socketSpamCount) {
    socketSpamChecker[socket.id] = 1;
  } else if(socketSpamCount > 3) {
    if(socket.socketWarningFlag) {
      socket.emit('news', 'There\'s too much traffic from your computer; refresh to reconnect!');
      socket.disconnect();
    } else {
      socket.socketWarningFlag = 1;
      socket.emit('news', 'It looks like you\'re sending a lot of requests... you aren\'t cheating, are you?');
    }
  } else ++socketSpamChecker[socket.id];

  // Check for spamming from a single IP address (warning at > 400 / second)
  if(!ipSpamCount) {
    ipSpamChecker[socket.ipAddress] = 1;
  } else if(++ipSpamCount > 400) {
    if(socket.ipWarningFlag) {
      socket.emit('news', 'There\'s too much traffic from your network. Try not to ruin the game for everyone, refresh to reconnect.');
      socket.disconnect();
    } else {
      socket.ipWarningFlag = 1;
      socket.emit('news', 'It looks like you\'re sending a lot of requests... you aren\'t cheating, are you?');
    }
  } else ++ipSpamChecker[socket.ipAddress];

  if(typeof location !== 'string') {
    socket.emit('news', 'Your location should be a string, sneakypants.');
    socket.superStrikes++;
  } else if(location.length > 20) {
    socket.emit('news', 'Your name can\'t be more than 20 characters, greedyguts.');
    socket.superStrikes++;
  } else {
    changedStoredPerson(key, location);
  }

  if(socket.superStrikes >= 3) {
    socket.emit('news', 'Okay, I get it, you\'re 1337. Try not to ruin the game for everyone, refresh to reconnect.');
    socket.disconnect();
  }
}

io.sockets.on('connection', function(socket) {
  socket.superStrikes = 0;
  socket.ipAddress = socket.handshake.address.address;
  newConnections.push(socket);
  socket.on('setPerson', function(key, location) {
    setPerson(key, location, socket);
  });

  socket.on('addPerson', function(name) {
    addPerson(name, socket);
  });
});
