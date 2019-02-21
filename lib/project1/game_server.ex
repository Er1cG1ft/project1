defmodule Project1.GameServer do
  use GenServer

  def reg(name) do
    {:via, Registry, {Project1.GameReg, name}}
  end

  def start(name) do
    spec = %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [name]},
      restart: :permanent,
      type: :worker,
    }
    Project1.GameSup.start_child(spec)
  end

  def start_link(name) do
    game = Project1.BackupAgent.get(name) || Project1.Game.new()
    GenServer.start_link(__MODULE__, game, name: reg(name))
  end

  def move(game, name, from, to) do
    GenServer.call(reg(name), {:move, name, from, to})
  end
  
  def add_player(game, name, playerName) do
    GenServer.call(reg(name), {:add_player, name, playerName})
  end
  
  def client_view(name) do
    GenServer.call(reg(name), {:client_view, name})
  end

  def init(game) do
    {:ok, game}
  end

  def handle_call({:move, name, from, to}, _from, game) do
    game = Project1.Game.move(game, from, to)
    Project1.BackupAgent.put(name, game)
    {:reply, game, game}
  end
  
  def handle_call({:add_player, name, playerName}, _from, game) do
    game = Project1.Game.add_player(game, playerName)
    Project1.BackupAgent.put(name, game)
    {:reply, game, game}
  end
  
  def handle_call({:client_view, name}, _from, game) do
    game = Project1.Game.client_view(game)
    Project1.BackupAgent.put(name, game)
    {:reply, game, game}
  end
end