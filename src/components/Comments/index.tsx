import React, { Component } from 'react';

export default class Comments extends Component {
  commentBox: any;

  constructor(props) {
    super(props);
    this.commentBox = React.createRef(); // Creates a reference to inject the <script> element
  }

  componentDidMount() {
    const utteranceTheme = 'github-dark';
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', true);
    scriptEl.setAttribute('repo', 'thiagothgb/ignite-primisc-challenge');
    scriptEl.setAttribute('issue-term', 'pathname');
    scriptEl.setAttribute('theme', utteranceTheme);
    this.commentBox.current.appendChild(scriptEl);
  }

  render() {
    return <div ref={this.commentBox} className="comment-box" />;
  }
}
