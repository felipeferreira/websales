class ClientesController < ApplicationController
  before_filter :require_user
  before_filter :lookup_cliente, :only => [:show, :edit, :update, :destroy, :toggle]
  before_filter :set_current_tab
  before_filter :require_admin, :only => [:destroy, :toggle]
 auto_complete_for :cliente,:nomefantasia

  def index
    unless params[:index]
    #  @clientes = Cliente.paginate :page => params[:page], :order => 'nomefantasia', :per_page => 10 
     @clientes = Cliente.paginate :page => params[:page], :conditions => ["nomefantasia like ?","%#{params[:q]}%"]
    
else
      @initial = params[:index]
      @clientes = Cliente.paginate :page => params[:page], :conditions => ["nomefantasia like ?", @initial+'%'], :order => 'nomefantasia', :per_page => 10
      # @clientes = Cliente.find(:all, :conditions => ['nomefantasia LIKE ?', "%#{params[:search]}%"])
    end
    @total_clientes = @clientes.total_entries
    
    respond_to do |format|
      format.html # index.html.erb
      format.js  #index.js.erb
      format.xml  { render :xml => @clientes }
    end
  end

  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @cliente }
    end
  end

  def new
    @cliente = Cliente.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @cliente }
    end
  end

  def edit
  end

  def create
    @cliente = Cliente.new(params[:cliente])

    respond_to do |format|
      if @cliente.save
        flash[:success] = "#{@cliente.nomefantasia} criado com sucesso!"
        format.html { redirect_to(@cliente) }
        format.xml  { render :xml => @cliente, :status => :created, :location => @cliente }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @cliente.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @cliente.update_attributes(params[:cliente])
        flash[:success] = "#{@cliente.nomefantasia} alterado com sucesso!"
        format.html { redirect_to(@cliente) }
        format.xml  { head :ok }
      else
        format.html { render :action => 'edit' }
        format.xml  { render :xml => @cliente.errors, :status => :unprocessable_entity }
      end
    end
  end

  def destroy
    @cliente.destroy
    respond_to do |format|
      format.html { redirect_to(clientes_url) }
      format.xml  { head :ok }
    end
  end

  def toggle
    if @cliente.enabled?
      @cliente.status = 0
      flash_msg = "#{@cliente.nomefantasia} was successfully disabled!"
    else
      @cliente.status = 1
      flash_msg = "#{@cliente.nomefantasia} was successfully enabled!"
    end

    respond_to do |format|
      if @cliente.save
        flash[:success] = flash_msg
        format.html { redirect_to(@cliente) }
        format.xml  { render :xml => @cliente, :status => :created, :location => @cliente }
      else
        format.html { render :action => 'index' }
        format.xml  { render :xml => @cliente.errors, :status => :unprocessable_entity }
      end
    end
  end

  private

  def lookup_cliente
    begin
      @cliente = Cliente.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      logger.error(":::Attempt to access invalid contact_id => #{params[:id]}")
      flash[:error] = 'You have requested an invalid contact!'
      redirect_to clientes_path
    end
  end

  def set_current_tab
    @current_tab = :clientes
  end
end
