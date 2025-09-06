class Api::TracksController < ApplicationController
  def index
    @tracks = Track.order(year: :desc, month: :desc, standing: :asc)
    
    grouped_tracks = @tracks.group_by { |track| [track.year, track.month] }
    
    response_data = grouped_tracks.map do |(year, month), tracks|
      {
        year: year,
        month: month,
        records: tracks
      }
    end
    
    render json: response_data
  end
end