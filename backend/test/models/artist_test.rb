require "test_helper"

class ArtistTest < ActiveSupport::TestCase
  test "mapped_genres returns correct parent genres" do
    GenreMapping.create!(name: 'pop rap', parent_genre: 'Hip Hop')
    GenreMapping.create!(name: 'trap', parent_genre: 'Hip Hop')
    GenreMapping.create!(name: 'synthpop', parent_genre: 'Pop')

    artist = Artist.new(genres: ['pop rap', 'trap', 'synthpop', 'unknown'].to_json)
    
    mapped = artist.mapped_genres
    assert_includes mapped, 'Hip Hop'
    assert_includes mapped, 'Pop'
    assert_equal 3, mapped.count
    # 'pop rap' -> 'Hip Hop'
    # 'trap' -> 'Hip Hop'
    # 'synthpop' -> 'Pop'
    # 'unknown' -> not in mappings
    
    assert_equal ['Hip Hop', 'Hip Hop', 'Pop'].sort, mapped.sort
  end

  test "parsed_genres handles various formats" do
    artist = Artist.new(genres: ['genre1', 'genre2'].to_json)
    assert_equal ['genre1', 'genre2'], artist.parsed_genres

    artist.genres = '["genre3"]'
    assert_equal ['genre3'], artist.parsed_genres

    artist.genres = nil
    assert_equal [], artist.parsed_genres
  end
end
