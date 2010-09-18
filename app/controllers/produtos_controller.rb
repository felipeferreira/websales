class ProdutosController < ApplicationController
before_filter :require_user  
before_filter :lookup_produto, :only => [:show, :edit, :update, :destroy, :toggle]  
before_filter :set_current_tab  
before_filter :require_admin, :only => [:destroy, :toggle]


  def index
    unless params[:index]
      @produtos = Produto.paginate :page=> params[:page],:order=> 'codigo,titulo',:per_page=>10
    else
      @initial = params[:index]
      @produtos = Produto.paginate :page=> params[:page],:conditions=>["titulo like ?",@initial+'%'],:order=>'codigo,titulo',:per_page=>10
    end
    @total_produtos = @produtos.total_entries

    respond_to do |format|
      format.html # index.html.erb
      format.js # index.js.erb
      format.xml  { render :xml => @produtos }
    end
  end

  def show
    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @produto }
    end
  end

  def new
    @produto = Produto.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @produto }
    end
  end

  def edit
  end

  def create
    @produto = Produto.new(params[:produto])

    respond_to do |format|
      if @produto.save
      	  flash[:success] = "#{produto.titulo} adicionado com sucesso!"
	format.html { redirect_to(@produto) }
        format.xml  { render :xml => @produto, :status => :created, :location => @produto }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @produto.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      if @produto.update_attributes(params[:produto])
        format.html { redirect_to(@produto, :notice => 'Produto was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @produto.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /produtos/1
  # DELETE /produtos/1.xml
  def destroy
    @produto = Produto.find(params[:id])
    @produto.destroy

    respond_to do |format|
      format.html { redirect_to(produtos_url) }
      format.xml  { head :ok }
    end
  end


  def toggle 
    if @produto.enabled?
      @produto.status = 0
      flash_msg = "#{@produto.titutlo} desativado com sucesso!"
    else
      @produto.status = 1
      flash_msg = "#{@produto.titutlo} ativado com sucesso!"
    end

    respond_to do |format|      
      if @produto.save
         flash[:success] = flash_msg 
         format.html { redirect_to(@produto) }
         format.xml  { render :xml => @produto, :status => :created, :location => @produto }
      else        
         format.html { render :action => 'index' }        
         format.xml  { render :xml => @produto.errors, :status => :unprocessable_entity }
      end
    end
 end

 private

 def lookup_produto
   begin
     @produto = Produto.find(params[:id])
   rescue ActiveRecord::RecordNotFound
     logger.error(":::Attempt to access invalid produto_id => #{params[:id]}")
     flash[:error] = 'You have requested an invalid product!'
     redirect_to produtos_path
   end
 end

 def set_current_tab
   @current_tab = :produtos
 end
end
