require "test_helper"

class Api::AutomatedInsightsTest < ActionDispatch::IntegrationTest
  setup do
    # Mock token for authentication
    @token = JsonWebToken.encode(user_id: 1)
    @headers = { 'Authorization' => "Bearer #{@token}" }
  end

  test "should get automated_insights" do
    # 1. Setup data for Consistency King (artist_1 appeared in 3 consecutive months)
    Artist.create!(artist_id: 'artist_1', name: 'Consistency Artist', year: 2024, month: 1, standing: 1)
    Artist.create!(artist_id: 'artist_1', name: 'Consistency Artist', year: 2024, month: 2, standing: 1)
    Artist.create!(artist_id: 'artist_1', name: 'Consistency Artist', year: 2024, month: 3, standing: 1)

    # 2. Setup data for Top Discovery (track_new first appeared in top 10)
    Track.create!(track_id: 'track_new', name: 'New Discovery', album_id: 'album_new', year: 2024, month: 4, standing: 5, artist_ids: ['artist_1'].to_json)
    Album.create!(album_id: 'album_new', name: 'New Album', album_type: 'album', year: 2024, month: 4, standing: 1, release_date: '2024-04-01')

    # 3. Setup data for Nostalgia Factor (> 40% catalog tracks)
    # Release date > 2 years before 2024-05-01
    Album.create!(album_id: 'album_old', name: 'Old Album', album_type: 'album', year: 2024, month: 5, standing: 1, release_date: '2020-01-01')
    Track.create!(track_id: 'track_old_1', name: 'Old Track 1', album_id: 'album_old', year: 2024, month: 5, standing: 1, artist_ids: ['artist_1'].to_json)
    Track.create!(track_id: 'track_old_2', name: 'Old Track 2', album_id: 'album_old', year: 2024, month: 5, standing: 2, artist_ids: ['artist_1'].to_json)
    Track.create!(track_id: 'track_new_2', name: 'New Track 2', album_id: 'album_new', year: 2024, month: 5, standing: 3, artist_ids: ['artist_1'].to_json)
    # 2 out of 3 tracks are catalog (> 40%)

    # 4. Setup data for Taste Shift (top genre change)
    GenreMapping.create!(name: 'rock', parent_genre: 'Rock')
    GenreMapping.create!(name: 'jazz', parent_genre: 'Jazz')
    Artist.create!(artist_id: 'artist_rock', name: 'Rock Artist', year: 2024, month: 6, standing: 1, genres: ['rock'].to_json)
    Artist.create!(artist_id: 'artist_jazz', name: 'Jazz Artist', year: 2024, month: 7, standing: 1, genres: ['jazz'].to_json)

    get api_analytics_automated_insights_url, headers: @headers
    assert_response :success
    
    json = JSON.parse(response.body)
    assert_kind_of Array, json
    
    types = json.map { |i| i['type'] }
    assert_includes types, "consistency_king"
    assert_includes types, "top_discovery"
    assert_includes types, "nostalgia_factor"
    assert_includes types, "taste_shift"
    
    # Verify Consistency King
    king = json.find { |i| i['type'] == "consistency_king" }
    assert_equal "Consistency Artist", king['data']['artist_name']
    assert_equal 3, king['data']['streak']
    
    # Verify Top Discovery
    discovery = json.find { |i| i['type'] == "top_discovery" && i['data']['name'] == "New Discovery" }
    assert_not_nil discovery
    assert_equal 4, discovery['data']['month']
    
    # Verify Nostalgia Factor
    nostalgia = json.find { |i| i['type'] == "nostalgia_factor" && i['data']['month'] == 5 }
    assert_not_nil nostalgia
    assert_operator nostalgia['data']['percentage'], :>, 40
    
    # Verify Taste Shift
    shift = json.find { |i| i['type'] == "taste_shift" && i['data']['month'] == 7 }
    assert_not_nil shift
    assert_equal "Rock", shift['data']['from']
    assert_equal "Jazz", shift['data']['to']
  end
end
