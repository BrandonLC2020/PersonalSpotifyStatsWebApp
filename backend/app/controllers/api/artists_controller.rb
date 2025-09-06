class Api::ArtistsController < ApplicationController
  def index
    @artists = Artist.order(:standing) # <-- Change this line
    render json: @artists
  end
end