var React = require('react/addons');
var Shared = require('./shared.jsx');
var PageLink = Shared.PageLink;

var Throne = React.createClass({
  handlePageChange: function(page) {
    this.props.onPageChange(page);
  },

  handleLocationSubmit: function(location){
    if (location !== this.props.location) {
      this.props.socket.emit('setPerson', this.props.key, location);
    }
  },

  render: function() {
    return (
      <div className="throne-page">
        <h1>{this.props.name}</h1>
        <ThroneMid location={this.props.location}
          onLocationSubmit={this.handleLocationSubmit} />
        <PageLink onPageChange={this.handlePageChange} page="scores">High Scores</PageLink>
      </div>
    );
  }
});

var ThroneMid = React.createClass({
  getInitialState: function() {
    return { formVisible: 0 };
  },

  handleLocationSubmit: function(location) {
    this.toggleFormDisplay();
    this.props.onLocationSubmit(location);
  },

  handleBlur: function(element) {
    //jumping through hoops because blur event might trigger
    //before submit, which kills the form when the submit
    //button is clicked
    setTimeout(function() {
      if(!element.contains(document.activeElement)) {
        this.toggleFormDisplay();
      }
    }.bind(this), 1);
  },

  toggleFormDisplay: function() {
    this.setState({ formVisible: 1 - this.state.formVisible });
  },

  render: function() {
    return (
      <div className="mid">
        { this.state.formVisible
          ? <ChallengerForm onLocationSubmit={this.handleLocationSubmit} handleBlur={this.handleBlur} />
          : <h2 onClick={this.toggleFormDisplay}>{this.props.location}</h2>
        }
      </div>
    );
  }
});

var ChallengerForm = React.createClass({
  getInitialState: function() {
    return {value: ''};
  },
  componentWillMount: function() {
    React.initializeTouchEvents(true);
  },
  componentDidMount: function() {
    key.setScope('input');
    key.filter = function filter(event){
      return true;
    };
    key('esc', this.props.handleBlur);
    this.refs.challenger.getDOMNode().focus();
  },
  componentWillUnmount: function() {
    key.setScope('all');
    key.filter = function filter(event){
      var tagName = (event.target || event.srcElement).tagName;
      return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
    };
    key.unbind('esc', this.props.handleBlur);
  },
  handleBlur: function() {
    //jumping through hoops (part 2)
    this.props.handleBlur(this.refs.form.getDOMNode());
  },
  handleChange: function(event) {
    this.setState({value: event.target.value.substr(0, 20)});
  },
  handleLocationSubmit: function() {
    var challengerNode = this.refs.challenger.getDOMNode();
    var challenger = challengerNode.value.trim();
    if (!challenger || typeof challenger !== 'string') {
      return false;
    }
    this.props.onLocationSubmit(challenger);
    this.refs.challenger.getDOMNode().value = '';
    return false;
  },
  render: function() {

    return (
      <form className="challengerForm" onBlur={this.handleBlur} onSubmit={this.handleLocationSubmit} ref="form" >
        <input type="text" placeholder="Sharing is caring!" ref="challenger" value={this.state.value} onChange={this.handleChange} />
      </form>
    );
  }
});

module.exports = Throne;
