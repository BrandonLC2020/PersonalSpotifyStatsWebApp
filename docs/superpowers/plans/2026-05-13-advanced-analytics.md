# Advanced Historical Analytics & Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the analytics system with hierarchical genre mapping and four automated insights (Top Discovery, Nostalgia Factor, Consistency King, Genre Pivot).

**Architecture:** 
- New `GenreMapping` model to group Spotify sub-genres into categories.
- Backend `AnalyticsController` extensions for trend aggregation and insight scanning.
- Frontend React components for stacked area charts and insight summary cards.

**Tech Stack:** Ruby on Rails (MySQL), React (TypeScript), Material UI, Recharts.

---

### Task 1: Create GenreMapping Model

**Files:**
- Create: `backend/app/models/genre_mapping.rb`
- Create: `backend/db/migrate/YYYYMMDDHHMMSS_create_genre_mappings.rb`
- Test: `backend/test/models/genre_mapping_test.rb`

- [ ] **Step 1: Write the model test**

```ruby
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bundle exec rake test test/models/genre_mapping_test.rb`

- [ ] **Step 3: Create the migration**

Run: `bundle exec rails generate migration CreateGenreMappings name:string:index parent_genre:string:index`

Modify the generated file to add uniqueness constraint:
```ruby
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
```

- [ ] **Step 4: Create the model**

```ruby
class GenreMapping < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :parent_genre, presence: true
end
```

- [ ] **Step 5: Run migration and verify tests pass**

Run: `bundle exec rails db:migrate && bundle exec rake test test/models/genre_mapping_test.rb`

- [ ] **Step 6: Commit**

```bash
git add backend/app/models/genre_mapping.rb backend/db/migrate/* backend/test/models/genre_mapping_test.rb
git commit -m "feat: add GenreMapping model and migration"
```

---

### Task 2: Seed Initial Genre Mappings

**Files:**
- Modify: `backend/db/seeds.rb`

- [ ] **Step 1: Add genre mapping seeds**

```ruby
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
```

- [ ] **Step 2: Run seeds**

Run: `bundle exec rails db:seed`

- [ ] **Step 3: Commit**

```bash
git add backend/db/seeds.rb
git commit -m "feat: seed initial genre mappings"
```

---

### Task 3: Implement Genre Evolution Endpoint

**Files:**
- Modify: `backend/app/controllers/api/analytics_controller.rb`
- Test: `backend/test/controllers/api/analytics_controller_test.rb`

- [ ] **Step 1: Write controller test**

```ruby
test "should get genre_evolution" do
  get api_analytics_genre_evolution_url
  assert_response :success
  json = JSON.parse(response.body)
  assert_kind_of Array, json
end
```

- [ ] **Step 2: Implement endpoint**

```ruby
def genre_evolution
  # Fetch all artists with their genres
  artists_data = Artist.pluck(:year, :month, :genres)
  
  # Load mappings
  mappings = GenreMapping.pluck(:name, :parent_genre).to_h
  
  grouped = artists_data.group_by { |year, month, _| [year, month] }
  
  response_data = grouped.map do |(year, month), rows|
    category_counts = Hash.new(0)
    total_genres = 0
    
    rows.each do |_, _, genres_raw|
      genres = genres_raw.is_a?(String) ? (JSON.parse(genres_raw) rescue []) : (genres_raw || [])
      genres.each do |g|
        parent = mappings[g] || "Other"
        category_counts[parent] += 1
        total_genres += 1
      end
    end
    
    # Calculate percentage share
    shares = category_counts.map do |cat, count|
      { category: cat, percentage: ((count.to_f / total_genres) * 100).round(1) }
    end
    
    {
      year: year.to_i,
      month: month.to_i,
      genres: shares.sort_by { |s| -s[:percentage] }
    }
  end
  
  render json: response_data.sort_by { |d| [d[:year], d[:month]] }
end
```

- [ ] **Step 3: Add route**

Modify `backend/config/routes.rb`:
```ruby
get 'analytics/genre_evolution', to: 'analytics#genre_evolution'
```

- [ ] **Step 4: Run tests**

- [ ] **Step 5: Commit**

```bash
git add backend/app/controllers/api/analytics_controller.rb backend/config/routes.rb backend/test/controllers/api/analytics_controller_test.rb
git commit -m "feat: implement genre_evolution endpoint"
```

---

### Task 4: Implement Automated Insights Endpoint

**Files:**
- Modify: `backend/app/controllers/api/analytics_controller.rb`

- [ ] **Step 1: Implement endpoint logic**

```ruby
def automated_insights
  insights = []
  
  # 1. Consistency King (Longest streak)
  # Simple version: count total monthly appearances in top 50
  top_consistent = Track.group(:track_id, :name).count.sort_by { |_, v| -v }.first
  if top_consistent
    insights << {
      type: 'consistency_king',
      title: 'Consistency King',
      description: "#{top_consistent[0][1]} has been in your top lists for #{top_consistent[1]} months!",
      icon: 'star'
    }
  end

  # 2. Top Discovery (First time in top 10)
  # Implementation: find entities where first appearance standing <= 10
  # (Abbreviated logic for plan)
  
  # 3. Nostalgia Factor (Catalog > 40%)
  # (Reuse logic from new_vs_catalog)

  render json: insights
end
```

- [ ] **Step 2: Add route and commit**

---

### Task 5: Frontend Genre Evolution Chart

**Files:**
- Create: `frontend/src/components/analytics/charts/GenreEvolutionChart.tsx`

- [ ] **Step 1: Create component using Recharts AreaChart**

---

### Task 6: Frontend Automated Insights View

**Files:**
- Create: `frontend/src/components/analytics/InsightCard.tsx`
- Create: `frontend/src/components/analytics/pages/AdvancedInsights.tsx`

---

### Task 7: Integrate into Analytics Dashboard

**Files:**
- Modify: `frontend/src/components/analytics/AnalyticsDashboard.tsx`

- [ ] **Step 1: Add "Advanced" tab and link to new components**
