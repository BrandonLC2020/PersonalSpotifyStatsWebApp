---
name: rails-stats-architect
description: Specialized in Ruby on Rails API development for Spotify listening statistics. Use for ActiveRecord grouping/aggregation (month/year), MySQL schema migrations, and maintaining the `api` namespace.
---

# Rails Stats Architect

Guidance for backend development and data modeling for the Spotify Stats application.

## API Structure
- **Namespace**: All routes must be under `api/`.
- **Controllers**: Located in `app/controllers/api/`. 
- **Response Format**: JSON only. Data should be grouped by `year` and `month`.

## Data Modeling
- **Track**: Stores `spotify_id`, `name`, `artist_name`, `album_name`, `played_at`.
- **Artist**: Stores `spotify_id`, `name`, `genres`, `popularity`.
- **Album**: Stores `spotify_id`, `name`, `artist_name`, `release_date`.

## Common Queries
- Use `group_by_month` (if `groupdate` gem is available) or raw ActiveRecord `GROUP BY` to aggregate stats.
- Efficiently calculate "Top 10" for a specific month using `count` and `order(count: :desc)`.

## Environment & Database
- **MySQL**: The database is hosted on AWS RDS.
- **Bastion**: Ensure the SSH tunnel is active for local database tasks (`bin/rails db:migrate`).
