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
  
  set_player(player) {
    this.player = player.id;
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
      this.channel.push("add_player", {name: window.playerName})
        .receive("ok", this.got_view.bind(this));
    }
    this.setState(view.game);
  }
  
  on_move(row, column) {
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
    
    if (left.player == 0){
      left.valid = true;
    } else if (left.player > 0 && left.player != this.player && this.state.pieces[row - 2][column - 2].player == 0) {
      this.state.pieces[row - 2][column - 2].jump = true;
    }
    
    if (right.player == 0){
      right.valid = true;
    } else if (right.player > 0 && right.player != this.player && this.state.pieces[row - 2][column + 2].player == 0) {
      this.state.pieces[row - 2][column + 2].jump = true;
    }
    
    // for (var i = 0; i < this.state.pieces.length; i++) {
    //   for (var j = 0; j < this.state.pieces[i].length; j++) {
    //     this.state.pieces[i][j].valid = false;
    //     if (i == row - 1 && j >= column - 1 && j <= column + 1 && this.state.pieces[i][j].player == 0) {
    //       this.state.pieces[i][j].valid = true;
    //     }
    //   }
    // }
    this.pieceSelected = {player: this.state.pieces[row][column].player, loc: [row, column]};
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
      <div className="container board">
          {result}
      </div>
    );
  }
}

function Piece(props) {
  if (props.player == 1) {
    return (
      <div className="piece black" onClick={() => props.root.on_select(props.row, props.col)}></div>
    )
  } else {
    return (
      <div className="piece red" onClick={() => props.root.on_select(props.row, props.col)}></div>
    )
  }
}

function Tile(props) {
  let piece;
  if (props.player > 0) {
    piece = <Piece 
              player={props.player} 
              root={props.root} 
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
        col={index}
        root={props.root} />
      </div>
      );
  });
  return <div className="row">{result}</div>;
}