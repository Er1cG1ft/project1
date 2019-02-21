defmodule Project1Web.GamesChannel do
  use Project1Web, :channel
  alias Project1.Game
  alias Project1.BackupAgent
  alias Project1.GameServer

  intercept ["update"]
  
  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      #game = BackupAgent.get(name) || Game.new()
      game = GameServer.start(name)
      BackupAgent.put(name, game)
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => GameServer.client_view(name)}, socket}
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
  
  def handle_in("add_player", %{"playerName" => playerName}, socket) do
    #name = socket.assigns[:name]
    game = GameServer.add_player(socket.assigns[:game], socket.assigns[:name], playerName)
    #socket = assign(socket, :game, game)
    #BackupAgent.put(name, game)
    push_update! game, socket
    #{:noreply, socket}
    {:reply, {:ok, %{ "game" => game}}, socket}
  end

  def handle_in("move", %{"from" => from, "to" => to}, socket) do
    game = GameServer.move(socket.assigns[:game], socket.assigns[:name], from, to)
    #socket = assign(socket, :game, game)
    #BackupAgent.put(name, game)
    push_update! game, socket
    #{:noreply, socket}
    {:reply, {:ok, %{ "game" => game}}, socket}
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