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
    # cond do
    #   Enum.at(players, 0).name == nil -> players = Map.put(Enum.at(players, 0), :name, name)
    #   Enum.at(players, 1).name == nil -> players = Map.put(Enum.at(players, 1), :name, name)
    #   true -> players = players ++ %{id: 0, name: name}
    # end
    IO.inspect(players)
    Map.merge(game, %{players: players})
  end
  
  def move(game, from, to) do
    pieces = Enum.map(Enum.with_index(game.pieces), fn {r, v} -> 
      Enum.map(Enum.with_index(r), fn {p, i} ->
        cond do
        (v == Enum.at(to, 0) && i == Enum.at(to, 1)) ->
          Map.put(p, :player, Map.get(from, "player"))
        (v == Enum.at(Map.get(from, "loc"), 0) && i == Enum.at(Map.get(from, "loc"), 1)) ->
          Map.put(p, :player, 0)
        ((Enum.at(to, 0) - Enum.at(Map.get(from, "loc"), 0) == 2 || Enum.at(Map.get(from, "loc"), 0) - Enum.at(to, 0) == 2)
              && (v == Enum.max([Enum.at(to, 0), Enum.at(Map.get(from, "loc"), 0)]) - 1 &&
              i == Enum.max([Enum.at(to, 1), Enum.at(Map.get(from, "loc"), 1)]) - 1)) ->
          Map.put(p, :player, 0)
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
        %{player: p, color: "gray"}
      end)
    end)
  end
  
end