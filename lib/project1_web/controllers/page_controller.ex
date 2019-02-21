defmodule Project1Web.PageController do
  use Project1Web, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
  
  def game(conn, %{"name" => name, "player_name" => player_name}) do
    render conn, "game.html", name: name, player_name: player_name
  end
end
