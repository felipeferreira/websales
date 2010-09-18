class PedidosController < ApplicationController
before_filter :require_user
  before_filter :lookup_cliente, :only => [:show, :edit, :update, :destroy, :toggle]
  before_filter :set_current_tab
  before_filter :require_admin, :only => [:destroy, :toggle]


  # GET /pedidos
  # GET /pedidos.xml
  def index
#   @pedidos = Pedido.paginate :page => params[:page], :conditions => ["nomefantasia like ?","%#{params[:q]}%"]
    @pedidos = Pedido.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @pedidos }
	format.js
    end
  end

  # GET /pedidos/1
  # GET /pedidos/1.xml
  def show
    @pedido = Pedido.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @pedido }
    end
  end

  # GET /pedidos/new
  # GET /pedidos/new.xml
  def new
    @pedido = Pedido.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @pedido }
    end
  end

  # GET /pedidos/1/edit
  def edit
    @pedido = Pedido.find(params[:id])
  end

  # POST /pedidos
  # POST /pedidos.xml
  def create
    @pedido = Pedido.new(params[:pedido])

    respond_to do |format|
      if @pedido.save
        format.html { redirect_to(@pedido, :notice => 'Pedido was successfully created.') }
        format.xml  { render :xml => @pedido, :status => :created, :location => @pedido }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @pedido.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /pedidos/1
  # PUT /pedidos/1.xml
  def update
    @pedido = Pedido.find(params[:id])

    respond_to do |format|
      if @pedido.update_attributes(params[:pedido])
        format.html { redirect_to(@pedido, :notice => 'Pedido was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @pedido.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /pedidos/1
  # DELETE /pedidos/1.xml
  def destroy
    @pedido = Pedido.find(params[:id])
    @pedido.destroy

    respond_to do |format|
      format.html { redirect_to(pedidos_url) }
      format.xml  { head :ok }
    end
  end
 def set_current_tab
    @current_tab = :pedidos
  end


end
