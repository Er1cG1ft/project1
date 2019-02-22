defmodule Project1.Game do
  def new do
    %{
      pieces: new_board(),
      players: [],
      turn: 1
    }
  end
  
  def client_view(game) do
    pieces = game.pieces
    players = game.players
    turn = game.turn
    %{
      pieces: pieces,
      players: players,
      turn: turn
    }
  end
  
  def add_player(game, playerName) do
    players = game.players
    players = players ++ [%{id: length(game.players) + 1, name: playerName}]
    IO.inspect(players)
    Map.merge(game, %{players: players})
  end
  
  def move(game, from, to) do
    moved_pieces = Enum.map(Enum.with_index(game.pieces), fn {r, v} -> 
      Enum.map(Enum.with_index(r), fn {p, i} ->
        cond do
        #move piece to new square
        (v == Enum.at(to, 0) && i == Enum.at(to, 1)) ->
          Map.merge(p, %{player: Map.get(from, "player"), king: Map.get(from, "king")})
          # Map.put(p, :player, Map.get(from, "player"))
          # Map.put(p, :king, Map.get(from, "king"))
        #remove piece from old square
        (v == Enum.at(Map.get(from, "loc"), 0) && i == Enum.at(Map.get(from, "loc"), 1)) ->
          Map.merge(p, %{player: 0, king: false})
          # Map.put(p, :player, 0)
          # Map.put(p, :king, false)
        #jump
        ((Enum.at(to, 0) - Enum.at(Map.get(from, "loc"), 0) == 2 || Enum.at(Map.get(from, "loc"), 0) - Enum.at(to, 0) == 2)
              && (v == Enum.max([Enum.at(to, 0), Enum.at(Map.get(from, "loc"), 0)]) - 1 &&
              i == Enum.max([Enum.at(to, 1), Enum.at(Map.get(from, "loc"), 1)]) - 1)) ->
          Map.put(p, :player, 0)
        true -> p
        end
      end)
    end)
    
    #check for kings
    pieces = Enum.map(Enum.with_index(moved_pieces), fn {r, v} -> 
      Enum.map(Enum.with_index(r), fn {p, i} ->
          cond do
            (Enum.at(to, 0) == 0 && game.turn == 1 && v == Enum.at(to, 0) && i == Enum.at(to, 1)) ->
              Map.put(p, :king, true)
            (Enum.at(to, 0) == 7 && game.turn == 2 && v == Enum.at(to, 0) && i == Enum.at(to, 1)) ->
              Map.put(p, :king, true)
            true -> p
          end
      end)
    end)

    Map.merge(game, %{pieces: pieces, turn: switch_turn(game.turn)})
  end
  
  def switch_turn(turn) do
    if turn == 1 do
      2
    else
      1
    end
  end
  
  def new_board do
    pieces = [
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
      ]
    Enum.map(pieces, fn r -> 
      Enum.map(r, fn p -> 
        %{player: p, king: false}
      end)
    end)
  end
  
end