# Design Doc: Advanced Historical Analytics & Insights

## Overview
This feature expands the existing Spotify analytics system with hierarchical genre mapping and automated insight discovery. It leverages existing monthly top track/artist/album snapshots to provide deeper, longitudinal trends and "magic" insights about the user's listening habits.

## 1. Data Model & Storage

### New Model: `GenreMapping`
- **Purpose**: Maps specific Spotify genres (sub-genres) to broader parent categories for cleaner aggregation.
- **Table**: `genre_mappings`
- **Fields**:
  - `id`: Primary Key
  - `name`: String (Unique, e.g., "pop rap", "indie soul")
  - `parent_genre`: String (e.g., "Hip Hop", "Soul/R&B")
- **Migrations**: Create `genre_mappings` table.
- **Seeds**: Include a baseline of common mappings.

### Model Enhancements
- **Artist**: Add `mapped_genres` method that retrieves `parent_genre` for each of the artist's genres using the `GenreMapping` table.

## 2. Backend Analytics Logic

### New Endpoints in `AnalyticsController`

#### `GET /api/analytics/genre_evolution`
- **Logic**:
  1. Fetch all top artists across all months.
  2. Map their genres to parent categories using `GenreMapping`.
  3. Aggregate counts of parent genres per [Year, Month].
  4. Normalize to percentage share (e.g., "Rock was 40% of your top artists in Jan 2024").
- **Output**: Time-series data formatted for a stacked area chart.

#### `GET /api/analytics/automated_insights`
- **Logic**:
  - **Top Discovery**: Find the first occurrence of a `track_id` or `artist_id` in the database. If the first occurrence has a `standing` <= 10, flag it as a "Top Discovery" for that month.
  - **Nostalgia Factor**: Calculate the percentage of "Catalog" tracks (released > 2 years prior to the snapshot month) for each month. Flag months where Catalog > 40%.
  - **Consistency King**: Identify the artist with the longest continuous streak of monthly appearances in the top 50.
  - **Genre Pivot**: Compare the #1 parent genre of month $N$ with month $N-1$. If the genre changes, flag it as a "Taste Shift".
- **Output**: A list of "Insight" objects with type, title, description, and supporting data.

## 3. Frontend Integration

### New Components
- **`GenreEvolutionChart`**: A stacked area chart using `recharts` to show broad category dominance over time.
- **`InsightCard`**: A Material UI card component for displaying individual automated insights with icons and descriptive text.
- **`AdvancedAnalyticsDashboard`**: A wrapper component to house these new visualizations.

### Navigation
- Add a new "Advanced" tab to the `AnalyticsDashboard` component.

## 4. Implementation Steps (Draft)
1. Create `GenreMapping` migration and model.
2. Seed initial genre mappings.
3. Implement `genre_evolution` logic in backend.
4. Implement `automated_insights` scanners in backend.
5. Create frontend components for the chart and insight cards.
6. Integrate into the main Analytics view.

## 5. Success Criteria
- Users can see clear trends in their music taste (e.g., "I listened to more Jazz in 2023").
- "Magic" insights correctly identify major shifts or long-term favorites.
- The genre mapping system is flexible and can be expanded without code changes.
