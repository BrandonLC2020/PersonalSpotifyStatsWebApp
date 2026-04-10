class Track < ApplicationRecord
  self.primary_key = 'track_id'

  scope :for_year, ->(year) { where(year: year).order(month: :asc, standing: :asc) }
  scope :for_month, ->(year, month) { where(year: year, month: month).order(standing: :asc) }

  def parsed_artist_ids
    return [] unless artist_ids.present?
    ids = artist_ids.is_a?(String) ? (JSON.parse(artist_ids) rescue []) : artist_ids
    ids.is_a?(Array) ? ids : [ids]
  end
end