class Api::AlbumsController < ApplicationController
  def index
    @albums = Album.order(:standing) # <-- Change this line
    render json: @albums
  end
end