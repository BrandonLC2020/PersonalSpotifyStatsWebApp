require "test_helper"

class GenreMappingTest < ActiveSupport::TestCase
  test "should be valid with name and parent_genre" do
    mapping = GenreMapping.new(name: "pop rap", parent_genre: "Hip Hop")
    assert mapping.valid?
  end

  test "should require unique name" do
    GenreMapping.create!(name: "pop rap", parent_genre: "Hip Hop")
    mapping = GenreMapping.new(name: "pop rap", parent_genre: "Something Else")
    assert_not mapping.valid?
  end
end
