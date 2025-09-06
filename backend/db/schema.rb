# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 0) do
  create_table "albums", primary_key: "album_id", id: :string, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "month"
    t.integer "year"
    t.integer "standing"
    t.string "name"
    t.string "album_type"
    t.string "release_date"
    t.json "images"
    t.json "artist_ids"
  end

  create_table "artists", primary_key: "artist_id", id: :string, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "month"
    t.integer "year"
    t.integer "standing"
    t.string "name"
    t.integer "popularity"
    t.json "genres"
    t.json "images"
  end

  create_table "tracks", primary_key: "track_id", id: :string, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.integer "month"
    t.integer "year"
    t.integer "standing"
    t.string "name"
    t.integer "duration_ms"
    t.boolean "is_explicit"
    t.integer "disc_number"
    t.integer "track_number"
    t.integer "popularity"
    t.string "album_id"
    t.json "artist_ids"
  end

end
