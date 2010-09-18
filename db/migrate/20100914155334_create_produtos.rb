class CreateProdutos < ActiveRecord::Migration
  def self.up
    create_table :produtos do |t|
      t.string :codigo
      t.string :titulo
      t.string :descricao
      t.decimal :preco
      t.string :imagem_url
      t.timestamps
    end
  end

  def self.down
    drop_table :produtos
  end
end
