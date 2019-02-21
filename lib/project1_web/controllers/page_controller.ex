defmodule Project1Web.PageController do
  use Project1Web, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
  
  def game(conn, %{"name" => name}) do
    render conn, "game.html", name: name, player_name: to_string(:inet_parse.ntoa(conn.remote_ip))
  end
end
