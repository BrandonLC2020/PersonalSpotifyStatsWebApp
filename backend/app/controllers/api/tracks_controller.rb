class Api::TracksController < ApplicationController
  def index
    @tracks = Track.order(:standing) # <-- Change this line
    render json: @tracks
  end
end