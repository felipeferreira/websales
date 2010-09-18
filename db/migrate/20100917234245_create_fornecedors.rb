class CreateFornecedors < ActiveRecord::Migration
  def self.up
    create_table :fornecedors do |t|
      t.string :nome
      t.string :endereco
      t.string :telefone
      t.string :celular
      t.string :email

      t.timestamps
    end
  end

  def self.down
    drop_table :fornecedors
  end
end
