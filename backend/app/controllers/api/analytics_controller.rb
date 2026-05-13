class Api::AnalyticsController < ApplicationController
  # GET /api/analytics/artist_track_dominance
  # Shows how many top track slots each artist occupies per month
  def artist_track_dominance
    query = params[:year] ? Track.for_year(params[:year].to_i) : Track.order(year: :desc, month: :desc, standing: :asc)
    
    # Use pluck to fetch only necessary columns
    data = query.pluck(:year, :month, :artist_ids)

    grouped = data.group_by { |year, month, _| [year, month] }

    # Build artist name lookup from Artist table
    artist_names = Artist.pluck(:artist_id, :name).to_h

    response_data = grouped.map do |(year, month), rows|
      artist_counts = Hash.new(0)

      rows.each do |_, _, artist_ids_raw|
        # Replicate parsed_artist_ids logic from Track model for raw data
        ids = if artist_ids_raw.is_a?(String)
                begin
                  JSON.parse(artist_ids_raw)
                rescue
                  []
                end
              else
                artist_ids_raw || []
              end
        ids = [ids] unless ids.is_a?(Array)

        ids.each do |artist_id|
          name = artist_names[artist_id] || artist_id
          artist_counts[name] += 1
        end
      end

      {
        year: year.to_i,
        month: month.to_i,
        artists: artist_counts.sort_by { |_, count| -count }.map { |name, count| { name: name, track_count: count } }
      }
    end

    render json: response_data.sort_by { |d| [d[:year], d[:month]] }
  end

  # GET /api/analytics/album_concentration
  # Shows how many tracks come from each album per month
  def album_concentration
    tracks_query = params[:year] ? Track.where(year: params[:year].to_i) : Track.all
    
    # Group by year, month, and album_id in DB
    counts = tracks_query.group(:year, :month, :album_id).count
    
    # Fetch album details efficiently
    album_ids = counts.keys.map(&:last).compact.uniq
    album_info = Album.where(album_id: album_ids).pluck(:album_id, :name, :album_type).each_with_object({}) do |(id, name, type), h|
      h[id] = { name: name, album_type: type }
    end

    # Group results by [year, month] for the final response
    grouped_response = counts.each_with_object({}) do |((year, month, album_id), count), h|
      next if album_id.nil?
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

  # GET /api/analytics/new_vs_catalog
  # Categorizes tracks by their album release date age using SQL aggregation
  def new_vs_catalog
    year_condition = params[:year].present? ? "AND tracks.year = #{ActiveRecord::Base.connection.quote(params[:year])}" : ""

    # SQL logic to categorize tracks based on release date age relative to the record month
    # new: <= 180 days, recent: 181-730 days, catalog: > 730 days or unknown
    # We use CAST(tracks.month AS UNSIGNED) to ensure chronological sorting since month is stored as a string
    sql = <<~SQL
      SELECT 
        tracks.year, 
        tracks.month,
        SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) <= 180 THEN 1 ELSE 0 END) as new_count,
        SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) > 180 AND DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) <= 730 THEN 1 ELSE 0 END) as recent_count,
        SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) > 730 OR albums.release_date IS NULL OR DATEDIFF(STR_TO_DATE(CONCAT(tracks.year, '-', tracks.month, '-01'), '%Y-%m-%d'), albums.release_date) IS NULL THEN 1 ELSE 0 END) as catalog_count
      FROM tracks
      LEFT JOIN albums ON tracks.album_id = albums.album_id
      WHERE tracks.year IS NOT NULL AND tracks.month IS NOT NULL #{year_condition}
      GROUP BY tracks.year, tracks.month
      ORDER BY tracks.year ASC, CAST(tracks.month AS UNSIGNED) ASC
    SQL

    results = ActiveRecord::Base.connection.exec_query(sql)

    response_data = results.map do |row|
      {
        year: row['year'].to_i,
        month: row['month'].to_i,
        new_count: row['new_count'].to_i,
        recent_count: row['recent_count'].to_i,
        catalog_count: row['catalog_count'].to_i
      }
    end

    render json: response_data
  end

  # GET /api/analytics/entity_churn?type=tracks|artists|albums
  # Shows which entities entered/exited the top list between consecutive months
  def entity_churn
    entity_type = params[:type] || 'tracks'

    model, id_field = case entity_type
                      when 'tracks' then [Track, 'track_id']
                      when 'artists' then [Artist, 'artist_id']
                      when 'albums' then [Album, 'album_id']
                      else
                        render json: { error: 'Invalid type. Use tracks, artists, or albums.' }, status: :bad_request
                        return
                      end

    # Use pluck to fetch only necessary columns
    data = model.order(year: :asc, month: :asc, standing: :asc).pluck(:year, :month, id_field)
    grouped = data.group_by { |year, month, _| [year, month] }.sort

    response_data = []
    previous_ids = Set.new

    grouped.each_with_index do |((year, month), month_rows), index|
      current_ids = Set.new(month_rows.map { |row| row[2] })

      if index == 0
        response_data << {
          year: year.to_i,
          month: month.to_i,
          entered: current_ids.to_a,
          exited: [],
          retained_count: 0
        }
      else
        entered = (current_ids - previous_ids).to_a
        exited = (previous_ids - current_ids).to_a
        retained = (current_ids & previous_ids).size

        response_data << {
          year: year.to_i,
          month: month.to_i,
          entered: entered,
          exited: exited,
          retained_count: retained
        }
      end

      previous_ids = current_ids
    end

    render json: response_data
  end

  # GET /api/analytics/year_summary?year=2025
  # Aggregated stats for a given year
  def year_summary
    year = params[:year]&.to_i
    unless year
      render json: { error: 'Year parameter is required' }, status: :bad_request
      return
    end

    year_tracks = Track.for_year(year)
    year_artists = Artist.for_year(year)
    year_albums = Album.for_year(year)

    # Most appeared entities
    top_track = year_tracks.group(:track_id)
                           .select('track_id, name, COUNT(*) as appearances')
                           .order('appearances DESC')
                           .first

    top_artist = year_artists.group(:artist_id)
                             .select('artist_id, name, COUNT(*) as appearances')
                             .order('appearances DESC')
                             .first

    top_album = year_albums.group(:album_id)
                           .select('album_id, name, COUNT(*) as appearances')
                           .order('appearances DESC')
                           .first

    # Genre counts
    genre_counts = Hash.new(0)
    year_artists.each do |artist|
      genres = artist.genres.is_a?(String) ? (JSON.parse(artist.genres) rescue []) : (artist.genres || [])
      genres.each { |g| genre_counts[g] += 1 }
    end

    # Monthly average popularity
    monthly_avg = year_tracks.group(:month)
                             .select('month, AVG(popularity) as avg_popularity')
                             .order(:month)
                             .map { |r| { month: r.month, avg_popularity: r.avg_popularity.to_f.round(1) } }

    render json: {
      year: year,
      top_track: top_track ? {
        name: top_track.name,
        id: top_track.track_id,
        months_appeared: top_track.attributes['appearances']
      } : nil,
      top_artist: top_artist ? {
        name: top_artist.name,
        id: top_artist.artist_id,
        months_appeared: top_artist.attributes['appearances']
      } : nil,
      top_album: top_album ? {
        name: top_album.name,
        id: top_album.album_id,
        months_appeared: top_album.attributes['appearances']
      } : nil,
      genre_counts: genre_counts.sort_by { |_, v| -v }.to_h,
      monthly_avg_popularity: monthly_avg,
      unique_tracks: year_tracks.distinct.count(:track_id),
      unique_artists: year_artists.distinct.count(:artist_id),
      unique_albums: year_albums.distinct.count(:album_id)
    }
  end

  # GET /api/analytics/genre_evolution
  # Tracks how music taste categories evolve over time
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
end
