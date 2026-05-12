class AddAnalyticsIndexes < ActiveRecord::Migration[7.0]
  def change
    add_index :tracks, [:year, :month]
    add_index :tracks, :album_id
    add_index :artists, [:year, :month]
    add_index :albums, [:year, :month]
  end
end
