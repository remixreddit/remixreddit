import $ from 'jquery'
import _ from 'underscore'

import React from 'react'
import ReactDOM from 'react-dom'

import { Router, Route, Link, browserHistory } from 'react-router'

var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

var StoryPreview = React.createClass({

  directLink: function() {
    var parser = document.createElement('a');
    parser.href = this.props.story.url;
    return parser.hostname == "i.imgur.com";
  },

  render: function() {
    var _this = this;

    function getEmbed() {
      var previewHtml = decodeEntities(_this.props.story.secure_media_embed.content)
      return { __html: previewHtml };
    }

    var preview = null;

    try {
      if (_this.props.story.secure_media_embed.content != null) {
        var preview = (
          <a href={this.props.story.url} target="_new">
            <div dangerouslySetInnerHTML={getEmbed()} />
          </a>
        );
      }
      else {
        if (this.directLink()) {
          var previewUrl = _this.props.story.url.replace("gifv", "gif");
        }
        else {
          var previewUrl = _this.props.story.preview.images[0].source.url;
        }

        var previewWidth = _this.props.story.preview.images[0].source.width;
        var preview = (
          <a href={this.props.story.url} target="_new">
            <img src={previewUrl} className="preview-image" />
          </a>
        );
      }
    }
    catch (e) {

    }

    return preview;
  },
})

var Story = React.createClass({
  render: function() {
    return (
      <div className="row story" key={this.props.story.name}>
        <div className="col-xs-2">
          <div className="story-score">
            {this.props.story.score}
          </div>
        </div>
        <div className="col-xs-10">
          <div className="row">
            <div className="col-xs-12 story-header">
              <a href={this.props.story.url} className="story-link">
                {this.props.story.title}
              </a>
              &nbsp;
              <span className="story-author">
                {this.props.story.author}
              </span>
            </div>
            <div className="col-xs-12 story-subheader">
              <a href={this.props.story.permalink}>
                {this.props.story.num_comments} comments
              </a>
            </div>
            <div className="col-xs-12">
              <StoryPreview story={this.props.story} />
            </div>
          </div>
        </div>
      </div>
    );
  },
})

var StoryList = React.createClass({
  render: function() {
    var storyNodes = _.compact(_.map(this.props.stories, function(story) {
      try {
        return <Story key={story.data.id} story={story.data} />;
      }
      catch (e) {
        return null;
      }
    }));

    return (
      <div className="col-xs-10 story-list">
        {storyNodes}
      </div>
    );
  },
});

var SubLinks = React.createClass({
  render: function() {
    return (
      <div className="col-xs-2 sublinks">
        <h1 className="title">
          Reddit
        </h1>
        <ul className="list-unstyled">
          <li>
            <Link to="/" className="btn">Frontpage</Link>
          </li>
          <li>
            <Link to="/r/aww" className="btn">Aww</Link>
          </li>
          <li>
            <Link to="/r/funny" className="btn">Funny</Link>
          </li>
          <li>
            <Link to="/r/pics" className="btn">Pics</Link>
          </li>
          <li>
            <Link to="/r/videos" className="btn">Videos</Link>
          </li>
        </ul>
      </div>
    );
  },
});

window.onscroll = function(ev) {
  var bottom500 = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200);

  if (bottom500) {
    $('body').trigger('bottom');
  }
};

var loadLocation = function(location, callback) {
  return $.ajax({
    url: location,
    dataType: "json",
    data: {
        format: "json"
    },
    success: function( response ) {
      callback(response.data.children);
    }
  });
};

var Subreddit = React.createClass({
  getInitialState: function() {
    return ({
      location: this.props.location,
      stories: [],
    });
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      location: nextProps.location,
      stories: [],
    })
    this.newStories(nextProps.location);
  },
  newStories: function(location) {
    var _this = this;
    var url = "https://www.reddit.com" + location + ".json";
    loadLocation(url, function(stories) {
      _this.setState({stories: stories});
    });
  },
  loadMore: function(location) {
    var _this = this;
    var url = "https://www.reddit.com" + location + ".json";

    if (this.state.stories.length > 0) {
      var storyLength = this.state.stories.length;
      var lastStory = this.state.stories[storyLength - 1];
      var last_name = lastStory.data.name;
      var url = "https://www.reddit.com" + location + ".json?after=" + last_name;
    }

    loadLocation(url, function(stories) {
      var stories = _this.state.stories.concat(stories);
      _this.setState({ stories: stories });
    });
  },
  componentDidMount: function() {
    var _this = this;
    var throttledMore = _.throttle(function() {
      _this.loadMore(_this.state.location)
    }, 3000);
    $('body').on("bottom", throttledMore);
    this.newStories(this.state.location);
  },
  render: function() {
    return (
      <StoryList stories={this.state.stories} />
    );
  },
})

var App = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <div className="row">
          <SubLinks />
          <Subreddit location={window.location.pathname} />
        </div>
      </div>
    );
  }
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
