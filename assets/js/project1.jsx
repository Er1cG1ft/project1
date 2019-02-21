import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';
import Player from './player';

export default function game_init(root, channel) {
  ReactDOM.render(<Project1 channel={channel} />, root);
}

class Project1 extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = {
        
    };
    this.board = null;
    this.height = window.innerHeight - 25;
    this.width = window.innerWidth - 25;
    this.player = null;
    this.velY = 0;
    this.velX = 0;
    this.speed = 2;
    this.friction = 0.98;
    this.keys = [];
    window.addEventListener('keyup', (e) => {this.keys[e.keyCode] = false});
    window.addEventListener('keydown', (e) => {this.keys[e.keyCode] = true});
    this.channel
        .join()
        .receive("ok",  this.got_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp); });
  }
  
  got_view(view) {
    console.log("Got view:");
    console.log(view);
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
  
  //set up game after dom loaded
  componentDidMount() {
    let board = this.refs.board.getContext('2d');
    this.board = board;
    this.player = new Player({position: [this.height/2, this.width/2]});
    this.renderPlayer(this.player.position);
    console.log(this.board);
    this.channel.push("add_player", { player: this.player.position })
        .receive("ok", this.got_view.bind(this));
    this.startGame();
    requestAnimationFrame(() => {this.update()});
  }
  
  renderPlayer(position) {
    this.board.save();
    this.board.fillStyle = 'gray';
    this.board.fillRect(0, 0, this.width, this.height);
    this.board.strokeStyle = '#ffffff';
    this.board.fillStyle = '#000000';
    this.board.lineWidth = 2;
    this.board.beginPath();
    this.board.arc(position.x, position.y, 5, 0, Math.PI * 2);
    this.board.closePath();
    this.board.fill();
    this.board.stroke();
    this.board.restore();
  }
  
  update() {
    requestAnimationFrame(() => {this.update()});
    if (this.keys[38]) {
      if (this.velY > -this.speed) {
          this.velY--;
      }
    }
    if (this.keys[40]) {
      if (this.velY < this.speed) {
          this.velY++;
      }
    }
    if (this.keys[39]) {
      if (this.velX < this.speed) {
          this.velX++;
      }
    }
    if (this.keys[37]) {
      if (this.velX > -this.speed) {
          this.velX--;
      }
    }
    
    this.velY *= this.friction;
    this.player.position.y += this.velY;
    this.velX *= this.friction;
    this.player.position.x += this.velX;

    if (this.player.position.x >= this.width - 5) {
        this.player.position.x = this.width - 5;
    } else if (this.player.position.x <= 5) {
        this.player.position.x = 5;
    }
    if (this.player.position.y > this.height - 5) {
        this.player.position.y = this.height - 5;
    } else if (this.player.position.y <= 5) {
        this.player.position.y = 5;
    }

    this.renderPlayer(this.player.position);

  }
  
  startGame(){
  }
  
  movePlayer(e) {
    this.keys[e.keyCode] = true;
    switch(e.keyCode) {
      //left
      case 37:
        if (this.velX > -this.speed) {
            this.velX--;
        }
        break;
      //right
      case 39:
        if (this.velX < this.speed) {
            this.velX++;
        }
        break;
      //up 
      case 38:
        if (this.velY > -this.speed) {
            this.velY--;
        }
        break;
      //down
      case 40:
        if (this.velY < this.speed) {
            this.velY++;
        }
        break;  
    }
    
    this.velY *= this.friction;
    this.player.position[1] += this.velY;
    this.velX *= this.friction;
    this.player.position[0] += this.velX;

    if (this.player.position[0] >= this.width - 5) {
        this.player.position[0] = this.width - 5;
    } else if (this.player.position[0] <= 5) {
        this.player.position[0] = 5;
    }

    if (this.player.position[1] > this.height - 5) {
        this.player.position[1] = this.height - 5;
    } else if (this.player.position[1] <= 5) {
        this.player.position[1] = 5;
    }
    this.renderPlayer(this.player.position);
}

  render() {
    return (
        <canvas className="board" ref="board" height={this.height} width={this.width} />
    );
  }
}