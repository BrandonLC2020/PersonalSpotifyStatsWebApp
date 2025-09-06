class Api::ArtistsController < ApplicationController
  def index
    @artists = Artist.order(:standing)
    response_data = @artists.map do |artist|
      image_urls = artist.images.is_a?(String) ? JSON.parse(artist.images) : artist.images
      {
        artist_id: artist.artist_id,
        name: artist.name,
        popularity: artist.popularity,
        genres: artist.genres,
        images: image_urls.map { |url| { 'url' => url } }
      }
    end
    render json: response_data
  end
end