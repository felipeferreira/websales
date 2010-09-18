class Cliente < ActiveRecord::Base
has_many:pedidos
has_many:tickets
belongs_to:user

 # Scopes
  named_scope :enabled, :order => 'nomefantasia', :conditions => { :status => nil }

 # Validations
  validates_presence_of :nomefantasia
  validates_format_of :email, :with => Authlogic::Regex.email

  def enabled?
    status.blank?
  end
end
