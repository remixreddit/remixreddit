import $ from 'jquery'
import _ from 'underscore'

import React from 'react'
import ReactDOM from 'react-dom'

import { Router, Route, Link, browserHistory } from 'react-router'

var Story = React.createClass({
  render: function() {

    return (
      <div className="row" key={this.props.story.name}>
        <div className="col-xs-1">
          {this.props.story.score}
        </div>
        <div className="col-xs-11">
          <a href={this.props.story.url}>
            {this.props.story.title}
          </a>
          <br/>
          {this.props.story.author}
        </div>
      </div>
    );
  },
})

var StoryList = React.createClass({
  render: function() {

    var indexNumber = 0;
    var storyNodes = _.compact(_.map(this.props.stories, function(story) {
      indexNumber += 1;

      try {
        return <Story key={story.data.id} story={story.data} indexNumber={indexNumber} />;
      }
      catch (e) {
        return null;
      }
    }));

    return (
      <div className="container">
        {storyNodes}
      </div>
    );
  },
});

var SubLinks = React.createClass({
  render: function() {
    return (
      <div>
        <h1>
          hello
        </h1>
        <div>
          <Link to="/r/aww">Awwww</Link>
        </div>
      </div>
    );
  },
});

window.onscroll = function(ev) {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
    $('body').trigger('bottom');
  }
};

var App = React.createClass({
  getInitialState: function() {

    var location = window.location.pathname;

    return ({
      url: location,
      stories: [],
    });
  },
  loadMore: function(location) {
    var _this = this;
    var url = "https://www.reddit.com" + location + ".json";

    if (this.state.stories.length > 0) {
      var storyLength = this.state.stories.length;
      var lastStory = this.state.stories[storyLength - 1];
      var last_name = lastStory.data.name;
      var url = "https://www.reddit.com/" + location + ".json?after=" + last_name;
    }

    $.ajax({
      url: url,
      dataType: "json",
      data: {
          format: "json"
      },
      success: function( response ) {
        var stories = _this.state.stories.concat(response.data.children);
        _this.setState({stories: stories});
      }
    });
  },
  componentDidMount: function() {
    var _this = this;

    var throttledMore = _.throttle(function() {
      _this.loadMore(_this.state.url)
    }, 3000);
    $('body').on("bottom", throttledMore);

    window.loadMore = this.loadMore;
    this.loadMore(this.state.url);
  },
  render: function() {
    return (
      <div>
        <SubLinks />
        <StoryList stories={this.state.stories} />
      </div>
    );
  },
});

var routeSet = (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="/r/:subreddit" component={App} />
    </Route>
  </Router>
)

ReactDOM.render(routeSet, document.getElementById('app'))
browserHistory.push(window.location.pathname);
