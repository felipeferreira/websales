class CreateClientes < ActiveRecord::Migration
  def self.up
    create_table :clientes do |t|
      t.string :nomefantasia, :null=>false
      t.string :razaosocial
      t.string :cnpj
      t.string :ie
      t.string :im
      t.string :endereco
      t.string :bairro
      t.string :cidade
      t.string :uf
      t.string :contato
      t.string :telefone
      t.string :celular
      t.string :email
      t.string :status
      t.references :user, :null=>false
      t.text :obs
      t.timestamps
    end
    add_index :clientes, :user_id
  end

  def self.down
    drop_table :clientes
  end
end
