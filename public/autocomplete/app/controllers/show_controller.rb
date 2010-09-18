class ShowController < ApplicationController
layout 'lists'
def index
@users=List.find(:all,:select=>"id as value,name as text").to_json
end
end
