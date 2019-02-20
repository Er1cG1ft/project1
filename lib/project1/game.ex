defmodule Project1.Game do
  def new do
    %{
      lastClick: [-1, -1, false],
      clicks: 0,
      won: false
    }
  end
  
  def client_view(game) do
    %{
      tiles: game.tiles,
      lastClick: game.lastClick,
      score: game.score,
      clicks: game.clicks
    }
  end
end