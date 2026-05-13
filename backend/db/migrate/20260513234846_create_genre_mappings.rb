class CreateGenreMappings < ActiveRecord::Migration[7.0]
  def change
    create_table :genre_mappings do |t|
      t.string :name, null: false
      t.string :parent_genre, null: false

      t.timestamps
    end
    add_index :genre_mappings, :name, unique: true
  end
end
