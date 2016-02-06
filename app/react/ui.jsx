var
React = require('react/addons'),
ReactCSSTransitionGroup = React.addons.CSSTransitionGroup,
Throne = require('./throne.jsx');

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

      this.socket.on('updatePeopleInitial', (function (people) {
        this.setState({people: people});
      }).bind(this));

    } else {
      throw new Error('window.location.hostname is ' + window.location.hostname +
        ' but we were expecting for it to be ' + this.props.cdnUrl +
        '. Change the value of cdnUrl in /app/js/main.jsx to the correct hostname.');
    }
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
        {boxes}
      </ReactCSSTransitionGroup>
    );
  }
});

module.exports = UI;
