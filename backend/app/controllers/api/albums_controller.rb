class Api::AlbumsController < ApplicationController
  def index
    @albums = Album.order(:standing)
    response_data = @albums.map do |album|
      image_urls = album.images.is_a?(String) ? JSON.parse(album.images) : album.images
      {
        album_id: album.album_id,
        name: album.name,
        album_type: album.album_type,
        release_date: album.release_date,
        images: image_urls.map { |url| { 'url' => url } }
      }
    end
    render json: response_data
  end
end