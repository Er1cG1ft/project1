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

  def move(name, from, to) do
    GenServer.call(reg(name), {:move, from, to})
  end

  def peek(name) do
    GenServer.call(reg(name), {:peek, name})
  end

  def init(game) do
    {:ok, game}
  end

  def handle_call({:move, name, from, to}, _from, game) do
    game = Project1.Game.move(game, from, to)
    Project1.BackupAgent.put(name, game)
    {:reply, game, game}
  end

  def handle_call({:peek, _name}, _from, game) do
    {:reply, game, game}
  end
end