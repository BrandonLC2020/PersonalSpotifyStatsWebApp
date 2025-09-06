class Api::AlbumsController < ApplicationController
  def index
    @albums = Album.order(year: :desc, month: :desc, standing: :asc)

    grouped_albums = @albums.group_by { |album| [album.year, album.month] }

    response_data = grouped_albums.map do |(year, month), albums|
      {
        year: year,
        month: month,
        records: albums.map do |album|
          image_urls = album.images.is_a?(String) ? JSON.parse(album.images) : album.images
          {
            album_id: album.album_id,
            name: album.name,
            album_type: album.album_type,
            release_date: album.release_date,
            images: image_urls.map { |url| { 'url' => url } }
          }
        end
      }
    end
    render json: response_data
  end
end