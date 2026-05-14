class Artist < ApplicationRecord
  self.primary_key = 'artist_id'

  scope :for_year, ->(year) { where(year: year).order(month: :asc, standing: :asc) }
  scope :for_month, ->(year, month) { where(year: year, month: month).order(standing: :asc) }

  def parsed_genres
    return [] unless genres.present?
    g = genres.is_a?(String) ? (JSON.parse(genres) rescue []) : genres
    g.is_a?(Array) ? g : [g]
  end

  def mapped_genres
    mappings = GenreMapping.where(name: parsed_genres).pluck(:parent_genre)
    # Ensure we handle genres without mappings if necessary, or just return the mapped ones
    mappings
  end
end