# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

puts "Seeding Genre Mappings..."

genre_data = {
  "Hip Hop" => ["pop rap", "trap", "rap", "southern hip hop", "gangster rap", "melodic rap", "underground hip hop"],
  "Rock" => ["album rock", "classic rock", "modern rock", "alternative rock", "indie rock", "hard rock", "punk", "permanent wave"],
  "Pop" => ["pop", "dance pop", "post-teen pop", "electropop", "indie pop", "art pop"],
  "Electronic" => ["edm", "house", "techno", "electronica", "indietronica", "alternative dance"],
  "R&B/Soul" => ["r&b", "soul", "neo soul", "contemporary r&b", "indie soul"],
  "Jazz" => ["jazz", "contemporary jazz", "vocal jazz", "bebop"]
}

genre_data.each do |parent, subs|
  subs.each do |sub|
    GenreMapping.find_or_create_by!(name: sub, parent_genre: parent)
  end
end

puts "Seeded #{GenreMapping.count} genre mappings."
