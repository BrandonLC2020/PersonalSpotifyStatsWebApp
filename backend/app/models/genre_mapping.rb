class GenreMapping < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :parent_genre, presence: true
end
