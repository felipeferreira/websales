class CreateItemPedidos < ActiveRecord::Migration
  def self.up
    create_table :item_pedidos do |t|
      t.integer :pedido_id
      t.integer :produto_id
      t.integer :quantidade
      t.decimal :preco

      t.timestamps
    end
  end

  def self.down
    drop_table :item_pedidos
  end
end
