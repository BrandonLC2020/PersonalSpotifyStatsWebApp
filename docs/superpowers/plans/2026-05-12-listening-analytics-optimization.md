# Listening Analytics Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move heavy Ruby-based data processing in `AnalyticsController` to MySQL/ActiveRecord and implement necessary database indexing for performance.

**Architecture:** Use ActiveRecord's grouping and aggregation features to perform heavy calculations in the database. Implement composite indexes on `(year, month)` to speed up time-based filtering. Use raw SQL fragments for complex date arithmetic in `new_vs_catalog`.

**Tech Stack:** Ruby on Rails, ActiveRecord, MySQL.

---

## File Mapping
- **Database Migration:** `db/migrate/YYYYMMDDHHMMSS_add_analytics_indexes.rb` (Adds indexes to `tracks`, `artists`, and `albums`)
- **Controller:** `app/controllers/api/analytics_controller.rb` (Refactor methods for performance)
- **Tests:** `test/controllers/api/analytics_controller_test.rb` (Verify results remain identical)

---

## Tasks

### Task 1: Database Indexing Migration

**Files:**
- Create: `backend/db/migrate/20260512000000_add_analytics_indexes.rb`

- [ ] **Step 1: Create the migration file**

```ruby
class AddAnalyticsIndexes < ActiveRecord::Migration[7.0]
  def change
    add_index :tracks, [:year, :month]
    add_index :tracks, :album_id
    add_index :artists, [:year, :month]
    add_index :albums, [:year, :month]
  end
end
```

- [ ] **Step 2: Run the migration**

Run: `cd backend && bin/rails db:migrate`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add backend/db/migrate/20260512000000_add_analytics_indexes.rb backend/db/schema.rb
git commit -m "db: add indexes for analytics optimization"
```

### Task 2: Optimize `album_concentration`

**Files:**
- Modify: `backend/app/controllers/api/analytics_controller.rb`
- Test: `backend/test/controllers/api/analytics_controller_test.rb`

- [ ] **Step 1: Write/Update test for `album_concentration`**
Ensure it returns the correct counts and album information.

- [ ] **Step 2: Refactor `album_concentration` to use ActiveRecord grouping**

```ruby
def album_concentration
  tracks_query = params[:year] ? Track.for_year(params[:year].to_i) : Track.all
  
  # Group by year, month, and album_id in DB
  counts = tracks_query.group(:year, :month, :album_id).count
  
  # Fetch album details efficiently
  album_ids = counts.keys.map(&:last).compact.uniq
  album_info = Album.where(album_id: album_ids).pluck(:album_id, :name, :album_type).each_with_object({}) do |(id, name, type), h|
    h[id] = { name: name, album_type: type }
  end

  # Group results by [year, month] for the final response
  grouped_response = counts.each_with_object({}) do |((year, month), count), h|
    next if album_id.nil? # Filtered in query but map for safety
    h[[year, month]] ||= []
    info = album_info[album_id] || { name: album_id, album_type: 'unknown' }
    h[[year, month]] << {
      album_id: album_id,
      name: info[:name],
      track_count: count,
      album_type: info[:album_type]
    }
  end

  response_data = grouped_response.map do |(year, month), albums|
    {
      year: year,
      month: month,
      albums: albums.sort_by { |a| -a[:track_count] }
    }
  end

  render json: response_data.sort_by { |d| [d[:year], d[:month]] }
end
```

- [ ] **Step 3: Verify tests pass**

- [ ] **Step 4: Commit**

```bash
git add backend/app/controllers/api/analytics_controller.rb
git commit -m "perf: optimize album_concentration with ActiveRecord grouping"
```

### Task 3: Optimize `new_vs_catalog`

**Files:**
- Modify: `backend/app/controllers/api/analytics_controller.rb`

- [ ] **Step 1: Refactor `new_vs_catalog` using SQL aggregation**

```ruby
def new_vs_catalog
  tracks_query = params[:year] ? Track.for_year(params[:year].to_i) : Track.all
  
  # Category logic in SQL
  # 6 months = 180 days, 24 months = 730 days
  category_sql = <<-SQL
    SELECT 
      tracks.year, 
      tracks.month,
      SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) <= 180 THEN 1 ELSE 0 END) as new_count,
      SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) > 180 AND DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) <= 730 THEN 1 ELSE 0 END) as recent_count,
      SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) > 730 OR albums.release_date IS NULL THEN 1 ELSE 0 END) as catalog_count
    FROM tracks
    LEFT JOIN albums ON tracks.album_id = albums.album_id
    WHERE tracks.year IS NOT NULL AND tracks.month IS NOT NULL
    #{"AND tracks.year = #{params[:year].to_i}" if params[:year]}
    GROUP BY tracks.year, tracks.month
    ORDER BY tracks.year ASC, tracks.month ASC
  SQL

  results = ActiveRecord::Base.connection.execute(category_sql)

  response_data = results.map do |row|
    {
      year: row[0],
      month: row[1],
      new_count: row[2],
      recent_count: row[3],
      catalog_count: row[4]
    }
  end

  render json: response_data
end
```

- [ ] **Step 2: Verify results match original logic**

- [ ] **Step 3: Commit**

```bash
git add backend/app/controllers/api/analytics_controller.rb
git commit -m "perf: optimize new_vs_catalog with SQL aggregation"
```

### Task 4: Optimize `artist_track_dominance` and `entity_churn`

**Files:**
- Modify: `backend/app/controllers/api/analytics_controller.rb`

- [ ] **Step 1: Refactor `artist_track_dominance` to use `pluck`**
- [ ] **Step 2: Refactor `entity_churn` to use `pluck`**

```ruby
def entity_churn
  # ... existing case logic ...
  records = model.order(year: :asc, month: :asc, standing: :asc).pluck(:year, :month, id_field)
  # Process lightweight array instead of AR objects
end
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/controllers/api/analytics_controller.rb
git commit -m "perf: optimize remaining analytics methods with pluck"
```
