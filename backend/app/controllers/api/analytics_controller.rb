class Api::AnalyticsController < ApplicationController
  # GET /api/analytics/artist_track_dominance
  # Shows how many top track slots each artist occupies per month
  def artist_track_dominance
    tracks = params[:year] ? Track.for_year(params[:year].to_i) : Track.order(year: :desc, month: :desc, standing: :asc)

    grouped = tracks.group_by { |t| [t.year, t.month] }

    # Build artist name lookup from Artist table
    artist_names = Artist.pluck(:artist_id, :name).to_h

    response_data = grouped.map do |(year, month), month_tracks|
      artist_counts = Hash.new(0)

      month_tracks.each do |track|
        ids = track.parsed_artist_ids
        ids.each do |artist_id|
          name = artist_names[artist_id] || artist_id
          artist_counts[name] += 1
        end
      end

      {
        year: year,
        month: month,
        artists: artist_counts.sort_by { |_, count| -count }.map { |name, count| { name: name, track_count: count } }
      }
    end

    render json: response_data.sort_by { |d| [d[:year], d[:month]] }
  end

  # GET /api/analytics/album_concentration
  # Shows how many tracks come from each album per month
  def album_concentration
    tracks = params[:year] ? Track.for_year(params[:year].to_i) : Track.order(year: :desc, month: :desc, standing: :asc)

    grouped = tracks.group_by { |t| [t.year, t.month] }

    # Build album name lookup
    album_info = Album.pluck(:album_id, :name, :album_type).each_with_object({}) do |(id, name, type), h|
      h[id] = { name: name, album_type: type }
    end

    response_data = grouped.map do |(year, month), month_tracks|
      album_counts = Hash.new(0)
      month_tracks.each { |t| album_counts[t.album_id] += 1 if t.album_id.present? }

      {
        year: year,
        month: month,
        albums: album_counts.sort_by { |_, count| -count }.map do |album_id, count|
          info = album_info[album_id] || { name: album_id, album_type: 'unknown' }
          {
            album_id: album_id,
            name: info[:name],
            track_count: count,
            album_type: info[:album_type]
          }
        end
      }
    end

    render json: response_data.sort_by { |d| [d[:year], d[:month]] }
  end

  # GET /api/analytics/new_vs_catalog
  # Categorizes tracks by their album release date age
  def new_vs_catalog
    tracks = params[:year] ? Track.for_year(params[:year].to_i) : Track.order(year: :desc, month: :desc, standing: :asc)

    grouped = tracks.group_by { |t| [t.year, t.month] }

    # Build album release date lookup
    album_dates = Album.pluck(:album_id, :release_date).to_h

    response_data = grouped.filter_map do |(year, month), month_tracks|
      # Skip records with nil or non-numeric year/month
      next unless year.is_a?(Integer) && month.is_a?(Integer)

      begin
        reference_date = Date.new(year, month, 1)
      rescue ArgumentError, TypeError
        next
      end

      new_count = 0
      recent_count = 0
      catalog_count = 0

      month_tracks.each do |track|
        release_str = album_dates[track.album_id]
        next unless release_str.present?

        begin
          release_str = release_str.to_s if release_str.is_a?(Date)

          # Handle various Spotify date formats: "2024-01-15", "2024-01", "2024"
          release_date = case release_str.length
                         when 4 then Date.new(release_str.to_i, 1, 1)
                         when 7 then Date.parse("#{release_str}-01")
                         else Date.parse(release_str)
                         end

          months_old = ((reference_date - release_date) / 30).to_i

          if months_old <= 6
            new_count += 1
          elsif months_old <= 24
            recent_count += 1
          else
            catalog_count += 1
          end
        rescue Date::Error, TypeError, ArgumentError
          catalog_count += 1 # default to catalog if date can't be parsed
        end
      end

      {
        year: year,
        month: month,
        new_count: new_count,
        recent_count: recent_count,
        catalog_count: catalog_count
      }
    end

    render json: response_data.sort_by { |d| [d[:year], d[:month]] }
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

    records = model.order(year: :asc, month: :asc, standing: :asc)
    grouped = records.group_by { |r| [r.year, r.month] }.sort

    response_data = []
    previous_ids = Set.new

    grouped.each_with_index do |((year, month), month_records), index|
      current_ids = Set.new(month_records.map { |r| r.send(id_field) })

      if index == 0
        response_data << {
          year: year,
          month: month,
          entered: current_ids.to_a,
          exited: [],
          retained_count: 0
        }
      else
        entered = (current_ids - previous_ids).to_a
        exited = (previous_ids - current_ids).to_a
        retained = (current_ids & previous_ids).size

        response_data << {
          year: year,
          month: month,
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
end
