class Pedido < ActiveRecord::Base
 belongs_to :contact
 belongs_to :cliente
 belongs_to :user
 has_many :produtos

 # Validations
 # validates_presence_of :title, :group_id, :status_id, :priority_id, :contact_i$

 def cliente_nomefantasia
	cliente.nomefantasia if cliente
 end
 
 def cliente_nomefantasia=(nomefantasia)
  self.cliente = Cliente.find_or_create_by_name(nomefantasia) unless nomefantasia.blank?
end

 


end
