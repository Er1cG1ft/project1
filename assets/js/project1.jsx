import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root, channel) {
  ReactDOM.render(<Project1 channel={channel} />, root);
}

class Project1 extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = {};
    
    this.channel
        .join()
        .receive("ok", this.got_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp); });
  }
  
  got_view(view) {
    this.setState(view.game);
  }
  
  on_move(row, column) {
    this.channel.push("move", { location: [row, column] })
        .receive("ok", this.got_view.bind(this));
  }

  restart(_ev) {
    this.channel.push("restart", {})
        .receive("ok", this.got_view.bind(this));
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="column">
            <h1>hello</h1>
          </div>
        </div>
      </div>
    );
  }
}
