import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';

export default function game_init(root, channel) {
  ReactDOM.render(<Project1 channel={channel} />, root);
}

class Project1 extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = {
        
    };
    this.player = -1;
    this.pieceSelected = null;
    this.channel
        .join()
        .receive("ok", this.got_view.bind(this))
        .receive("error", resp => { console.log("Unable to join", resp); });
    this.channel.on("update", this.got_view.bind(this));
  }
  
  got_view(view) {
    console.log("Got view:");
    console.log(view);
    this.user = view.game.players.find(function(element) {
      return element.name == window.playerName;
    });
    if (this.user != undefined) {
      this.player = this.user.id;
    }
    if (this.player < 0) {
      this.channel.push("add_player", {playerName: window.playerName})
        .receive("ok", this.got_view.bind(this));
    }
    if (this.player != undefined && view.game.pieces != undefined) {
      if (this.player == 2) {
        view.game.pieces = _.reverse(view.game.pieces);
        for(var i = 0; i < view.game.pieces.length; i++) {
          view.game.pieces[i] = _.reverse(view.game.pieces[i]);
        }
      }
    }
    this.setState(view.game);
  }
  
  on_move(row, column) {
    if (this.player == 2) {
      row = 7 - row;
      column = 7 - column;
      this.pieceSelected.loc = [7 - this.pieceSelected.loc[0], 7 - this.pieceSelected.loc[1]];
    }
    this.channel.push("move", { from: this.pieceSelected, to: [row, column] })
        .receive("ok", this.got_view.bind(this));
  }
  
  on_select(row, column) {
    for (var i = 0; i < this.state.pieces.length; i++) {
      for (var j = 0; j < this.state.pieces[i].length; j++) {
        this.state.pieces[i][j].valid = false;
        this.state.pieces[i][j].jump = false;
      }
    }
    let left = this.state.pieces[row - 1][column - 1];
    let right = this.state.pieces[row - 1][column + 1];
    
    if (left != undefined) {
      if (left.player == 0) {
        left.valid = true;
      } else if (left.player > 0 && left.player != this.player && this.state.pieces[row - 2] != undefined 
                && this.state.pieces[row - 2][column - 2] != undefined && this.state.pieces[row - 2][column - 2].player == 0) {
        this.state.pieces[row - 2][column - 2].jump = true;
      }
    }
    
    if (right != undefined) {
      if (right.player == 0) {
        right.valid = true;
      } else if (right.player > 0 && right.player != this.player && this.state.pieces[row - 2] != undefined
                && this.state.pieces[row - 2][column + 2] != undefined && this.state.pieces[row - 2][column + 2].player == 0) {
        this.state.pieces[row - 2][column + 2].jump = true;
      }
    }
    
    let king = this.state.pieces[row][column].king;
    if (king) {
      let left = this.state.pieces[row + 1][column - 1];
      let right = this.state.pieces[row + 1][column + 1];
      
      if (left != undefined) {
        if (left.player == 0) {
          left.valid = true;
        } else if (left.player > 0 && left.player != this.player && this.state.pieces[row + 2] != undefined 
                  && this.state.pieces[row + 2][column - 2] != undefined && this.state.pieces[row + 2][column - 2].player == 0) {
          this.state.pieces[row + 2][column - 2].jump = true;
        }
      }
      
      if (right != undefined) {
        if (right.player == 0) {
          right.valid = true;
        } else if (right.player > 0 && right.player != this.player && this.state.pieces[row + 2] != undefined
                  && this.state.pieces[row + 2][column + 2] != undefined && this.state.pieces[row + 2][column + 2].player == 0) {
          this.state.pieces[row + 2][column + 2].jump = true;
        }
      }
    }

    this.pieceSelected = {player: this.state.pieces[row][column].player, loc: [row, column], king: this.state.pieces[row][column].king};
    this.setState(this.state);
  }

  render() {
    let result = _.map(this.state.pieces, (row, index) => {
      return <Row
        row={row}
        root={this}
        player={this.player}
        rowNum={index}
        key={index}
        />
    });
    return (
      <span>
      <div className="players"><Players name={this.state.players} root={this} me={this.player}/></div>
      <div className="container board">
          {result}
      </div>
      </span>
    );
  }
}

function Players(props) {
  if (props.root.state.players != undefined) {
  let p1 = props.root.state.players.find(function(element) {
      return element.id == props.me;
    });
  if (p1 == undefined) {
    return null;
  }
  let p2Id = 0;
  if (p1.id == 1) {
    p2Id = 2;
  } else {
    p2Id = 1;
  }
  let p2 = props.root.state.players.find(function(element) {
      return element.id == p2Id;
    });
  let name = "";
  if (p2 != undefined) {
    name = p2.name;
  } 
  
  let turn = "Waiting for player.";
  if (props.root.state.players.length >= 2 && props.root.state.turn == props.root.player) {
    turn = "Your turn!"
  } else if (props.root.state.players.length >= 2 && props.root.state.turn != props.root.player) {
    turn = "Their turn."; 
  }
  return (
    <div className="playerBox">
      <div className="row">
        <div className="column">
          <h2 className="player1">{p1.name}</h2>
          {turn}
        </div>
        <div className="column">
          <h2 className="player2">{name}</h2>
        </div>
      </div>
    </div>
    )
  } else {
    return null;
  }
}

function Piece(props) {
  let classes = "piece";
  if (props.player == 1) {
    classes += " red";
  } else {
    classes += " black";
  }
  
  let icon = "";
  if (props.king) {
    icon = <i className="fas fa-crown"></i>;
  }
  
  if (props.root.state.players.length >= 2 && props.root.player == props.root.state.turn 
      && props.root.player == props.player) {
    classes += " hover";
    return (
      <div className={classes} onClick={() => props.root.on_select(props.row, props.col)}>{icon}</div>
    )
  } else {
    return (
      <div className={classes}>{icon}</div>
    )
  }
}

function Tile(props) {
  let piece;
  if (props.player > 0) {
    piece = <Piece 
              player={props.player} 
              root={props.root} 
              king={props.king}
              row={props.row}
              col={props.col} />;
  }
  let classes = "tile";
  if (props.col % 2 != props.row % 2) {
    classes += " gray";
  }
  if (props.valid) {
    classes += " no-piece";
    return (
    <div className={classes} onClick={() => props.root.on_move(props.row, props.col)}>
      <div className="valid highlight">
        {piece}
      </div>
    </div>
    )
  } else if (props.jump) {
    classes += " no-piece";
    return (
    <div className={classes} onClick={() => props.root.on_move(props.row, props.col)}>
      <div className="jump highlight">
        {piece}
      </div>
    </div>
    )
  } else {
    return (
    <div className={classes} >
        {piece}
    </div>
    )
  }
  
}

function Row(props) {
  let result = _.map(props.row, (col, index) => {
    return (
      <div className="column board-column" key={index}>
        <Tile 
        name={col.name}
        row={props.rowNum}
        player={col.player}
        valid={col.valid}
        jump={col.jump}
        king={col.king}
        col={index}
        root={props.root} />
      </div>
      );
  });
  return <div className="row">{result}</div>;
}