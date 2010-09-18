class FornecedorsController < ApplicationController
  # GET /fornecedors
  # GET /fornecedors.xml
  def index
    @fornecedors = Fornecedor.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @fornecedors }
    end
  end

  # GET /fornecedors/1
  # GET /fornecedors/1.xml
  def show
    @fornecedor = Fornecedor.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @fornecedor }
    end
  end

  # GET /fornecedors/new
  # GET /fornecedors/new.xml
  def new
    @fornecedor = Fornecedor.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @fornecedor }
    end
  end

  # GET /fornecedors/1/edit
  def edit
    @fornecedor = Fornecedor.find(params[:id])
  end

  # POST /fornecedors
  # POST /fornecedors.xml
  def create
    @fornecedor = Fornecedor.new(params[:fornecedor])

    respond_to do |format|
      if @fornecedor.save
        format.html { redirect_to(@fornecedor, :notice => 'Fornecedor was successfully created.') }
        format.xml  { render :xml => @fornecedor, :status => :created, :location => @fornecedor }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @fornecedor.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /fornecedors/1
  # PUT /fornecedors/1.xml
  def update
    @fornecedor = Fornecedor.find(params[:id])

    respond_to do |format|
      if @fornecedor.update_attributes(params[:fornecedor])
        format.html { redirect_to(@fornecedor, :notice => 'Fornecedor was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @fornecedor.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /fornecedors/1
  # DELETE /fornecedors/1.xml
  def destroy
    @fornecedor = Fornecedor.find(params[:id])
    @fornecedor.destroy

    respond_to do |format|
      format.html { redirect_to(fornecedors_url) }
      format.xml  { head :ok }
    end
  end
end
