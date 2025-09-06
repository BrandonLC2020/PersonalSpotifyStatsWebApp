class Api::ArtistsController < ApplicationController
  def index
    @artists = Artist.order(year: :desc, month: :desc, standing: :asc)
    
    grouped_artists = @artists.group_by { |artist| [artist.year, artist.month] }

    response_data = grouped_artists.map do |(year, month), artists|
      {
        year: year,
        month: month,
        records: artists.map do |artist|
          image_urls = artist.images.is_a?(String) ? JSON.parse(artist.images) : artist.images
          {
            artist_id: artist.artist_id,
            name: artist.name,
            popularity: artist.popularity,
            genres: artist.genres,
            images: image_urls.map { |url| { 'url' => url } }
          }
        end
      }
    end
    render json: response_data
  end
end