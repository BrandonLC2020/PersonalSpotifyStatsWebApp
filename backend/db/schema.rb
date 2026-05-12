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

ActiveRecord::Schema[7.0].define(version: 2026_05_12_000000) do
  create_table "albums", primary_key: ["month", "year", "standing"], charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "month", limit: 20, null: false
    t.integer "year", null: false
    t.integer "standing", null: false
    t.string "name"
    t.string "album_id", limit: 50, null: false
    t.string "album_type", limit: 50
    t.string "release_date", limit: 20
    t.json "images"
    t.json "artist_ids"
    t.index ["year", "month"], name: "index_albums_on_year_and_month"
  end

  create_table "artists", primary_key: ["month", "year", "standing"], charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "month", limit: 20, null: false
    t.integer "year", null: false
    t.integer "standing", null: false
    t.string "name"
    t.string "artist_id", limit: 50, null: false
    t.integer "popularity"
    t.json "genres"
    t.json "images"
    t.index ["year", "month"], name: "index_artists_on_year_and_month"
  end

  create_table "config", primary_key: "config_key", id: :string, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.text "config_value", null: false
    t.timestamp "updated_at", default: -> { "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
  end

  create_table "tracks", primary_key: ["month", "year", "standing"], charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "month", limit: 20, null: false
    t.integer "year", null: false
    t.integer "standing", null: false
    t.string "name"
    t.string "track_id", limit: 50, null: false
    t.integer "duration_ms"
    t.boolean "is_explicit"
    t.integer "disc_number"
    t.integer "track_number"
    t.integer "popularity"
    t.string "album_id", limit: 50
    t.json "artist_ids"
    t.index ["album_id"], name: "index_tracks_on_album_id"
    t.index ["year", "month"], name: "index_tracks_on_year_and_month"
  end

end
