require "test_helper"

class Api::AnalyticsControllerTest < ActionDispatch::IntegrationTest
  setup do
    # Create some test data
    @album = Album.create!(album_id: 'album_1', name: 'Test Album', album_type: 'album', year: 2024, month: 1, standing: 1)
    @track = Track.create!(track_id: 'track_1', name: 'Test Track', album_id: 'album_1', year: 2024, month: 1, standing: 1, artist_ids: ['artist_1'].to_json)
    @artist = Artist.create!(artist_id: 'artist_1', name: 'Test Artist', year: 2024, month: 1, standing: 1)
    
    # Mock token for authentication
    @token = JsonWebToken.encode(user_id: 1)
    @headers = { 'Authorization' => "Bearer #{@token}" }
  end

  test "should get album_concentration" do
    get api_analytics_album_concentration_url, headers: @headers
    assert_response :success
    
    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    
    unless json_response.empty?
      first_item = json_response.first
      assert_includes first_item.keys, "year"
      assert_includes first_item.keys, "month"
      assert_includes first_item.keys, "albums"
    end
  end

  test "should get album_concentration with year filter" do
    get api_analytics_album_concentration_url, params: { year: 2024 }, headers: @headers
    assert_response :success
    
    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
  end

  test "should get new_vs_catalog" do
    get api_analytics_new_vs_catalog_url, headers: @headers
    assert_response :success
    
    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    
    unless json_response.empty?
      first_item = json_response.first
      assert_includes first_item.keys, "year"
      assert_includes first_item.keys, "month"
      assert_includes first_item.keys, "new_count"
      assert_includes first_item.keys, "recent_count"
      assert_includes first_item.keys, "catalog_count"
    end
  end

  test "should get artist_track_dominance" do
    get api_analytics_artist_track_dominance_url, headers: @headers
    assert_response :success
    
    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    
    unless json_response.empty?
      first_item = json_response.first
      assert_includes first_item.keys, "year"
      assert_includes first_item.keys, "month"
      assert_includes first_item.keys, "artists"
      
      artist_data = first_item["artists"].first
      assert_includes artist_data.keys, "name"
      assert_includes artist_data.keys, "track_count"
    end
  end

  test "should get entity_churn" do
    get api_analytics_entity_churn_url, params: { type: 'tracks' }, headers: @headers
    assert_response :success
    
    json_response = JSON.parse(response.body)
    assert_kind_of Array, json_response
    
    unless json_response.empty?
      first_item = json_response.first
      assert_includes first_item.keys, "year"
      assert_includes first_item.keys, "month"
      assert_includes first_item.keys, "entered"
      assert_includes first_item.keys, "exited"
      assert_includes first_item.keys, "retained_count"
    end
  end

  test "should get genre_evolution" do
    get api_analytics_genre_evolution_url, headers: @headers
    assert_response :success
    json = JSON.parse(response.body)
    assert_kind_of Array, json
  end
end
