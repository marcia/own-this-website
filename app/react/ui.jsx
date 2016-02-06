var React = require('react/addons');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Throne = require('./throne.jsx');

var UI = React.createClass({
  getInitialState: function() {
    return {
      page: 'throne',
      kingName: '',
      kingScore: 0,
      scores: [1, 2, 3],
      secondsElapsed: 0
    };
  },

  handlePageChange: function(page) {
    this.setState({ page: page });
  },
  componentDidMount: function() {
    if(window.location.hostname === this.props.cdnUrl) {
      // extend io.connect to add a news listener to all new connections
      io.connect = (function(originalFunction) {
        return function(url) {
          var socket = originalFunction(url);
          socket.on('news', function(message) {
            console.log(message);
          });
          return socket;
        };
      })(io.connect);

      this.socket = io.connect('http://' + this.props.socketUrl + ':' + this.props.socketPort);

      this.socket.on('updatePerson', (function (person) {
        var people = this.state.people;
        people[person.key] = person;
        this.setState({people: people});
      }).bind(this));

      this.socket.on('updatePeople', (function (people) {
        this.setState({people: people});
      }).bind(this));

    } else {
      throw new Error('window.location.hostname is ' + window.location.hostname +
        ' but we were expecting for it to be ' + this.props.cdnUrl +
        '. Change the value of cdnUrl in /app/js/main.jsx to the correct hostname.');
    }
  },

  handleAddPersonClick: function() {
    var name = prompt('What\'s your name?');

    if (!name) {
      // If they didn't type anything, return!
      return;
    }

    if (this.state.people[name]) {
      // If we already have this person on the board, return!
      // TODO(marcia): Consider showing an error message
      return;
    }

    // TODO(marcia): Do more validation things. Reject duplicate names
    // regardless of case and punctuation maybe, sanitize, trim, etc.

    // TODO(marcia): This might add the person somewhere random. Tweak so
    // everything is more compact and readable for these purposes.
    this.socket.emit('addPerson', name);
  },

  render: function() {
    var boxes = [];
    if (this.state.people) {
      for (personKey in this.state.people) {
        var person = this.state.people[personKey];
        boxes.push(<Throne
          key={person.key}
          name={person.name}
          location={person.location}
          socket={this.socket} />);
      }
    }

    return (
      <ReactCSSTransitionGroup transitionName="window" component={React.DOM.div}>
        <a className="page-link" onClick={this.handleAddPersonClick.bind(this)}>
          Add yourself!
        </a>

        {boxes}
      </ReactCSSTransitionGroup>
    );
  }
});

module.exports = UI;
