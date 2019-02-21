defmodule Project1Web.GamesChannel do
  use Project1Web, :channel
  alias Project1.Game
  alias Project1.BackupAgent

  intercept ["update"]
  
  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = BackupAgent.get(name) || Game.new()
      BackupAgent.put(name, game)
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (games:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end
  
  def handle_in("add_player", %{"name" => playerName}, socket) do
    name = socket.assigns[:name]
    game = Game.add_player(socket.assigns[:game], playerName)
    push_update! game, socket
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    {:noreply, socket}
    #{:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  def handle_in("move", %{"from" => from, "to" => to}, socket) do
    name = socket.assigns[:name]
    game = Game.move(socket.assigns[:game], from, to)
    push_update! game, socket
    socket = assign(socket, :game, game)
    BackupAgent.put(name, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end
  
  def handle_out("update", game_data, socket) do
    IO.inspect("Broadcasting update to #{socket.assigns[:user]}")
    push socket, "update", %{ "game" => game_data }
    {:noreply, socket}
  end

  defp push_update!(view, socket) do
    broadcast!(socket, "update", view)
  end
  
  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end