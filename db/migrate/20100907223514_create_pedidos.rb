class CreatePedidos < ActiveRecord::Migration
  def self.up
    create_table :pedidos do |t|
      t.text :descricao

      t.timestamps
    end
  end

  def self.down
    drop_table :pedidos
  end
end
