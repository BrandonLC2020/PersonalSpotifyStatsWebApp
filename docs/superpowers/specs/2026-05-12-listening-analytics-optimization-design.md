# Design Specification: Listening Analytics Optimization

**Date:** 2026-05-12
**Status:** Approved
**Tasks:** [86b9gcxpu](https://app.clickup.com/t/86b9gcxpu), [86b9gcxqx](https://app.clickup.com/t/86b9gcxqx), [86b9gcxqw](https://app.clickup.com/t/86b9gcxqw)

## 1. Objective
Optimize the `AnalyticsController` in the Ruby on Rails backend by moving data processing (grouping, filtering, and aggregation) from Ruby memory to MySQL using ActiveRecord and raw SQL where necessary. Implement database indexing to support these performance improvements.

## 2. Infrastructure Changes (Indexing)
To support efficient time-based and relational queries, the following indexes will be added via a Rails migration:

- **Tracks Table:**
  - `composite index (year, month)`: For rapid filtering and grouping by time periods.
  - `index (album_id)`: For efficient joining with the `albums` table and counting occurrences.
- **Artists Table:**
  - `composite index (year, month)`: To optimize time-based lookups.
- **Albums Table:**
  - `composite index (year, month)`: To optimize time-based lookups.

## 3. Query Logic Optimizations

### 3.1 `album_concentration`
- **Current:** Ruby `group_by` and manual counting.
- **Optimization:** Use ActiveRecord's `.group(:year, :month, :album_id).count`.
- **Data Flow:** MySQL returns a hash of `[[year, month, album_id], count]`, which is then mapped to the final JSON structure.

### 3.2 `new_vs_catalog`
- **Current:** Ruby date arithmetic on every track.
- **Optimization:** Use a SQL `CASE` statement to categorize tracks based on the difference between the album's `release_date` and the listening month.
- **SQL Logic:** 
  ```sql
  SUM(CASE WHEN DATEDIFF(STR_TO_DATE(CONCAT(year, '-', month, '-01'), '%Y-%m-%d'), release_date) <= 180 THEN 1 ELSE 0 END) AS new_count
  ```
- **Benefit:** Reduces thousands of track object instantiations to a single aggregated query result.

### 3.3 `artist_track_dominance`
- **Current:** Ruby iteration over JSON `artist_ids`.
- **Optimization:** Use `pluck(:year, :month, :artist_ids)` to retrieve only the necessary data, minimizing memory overhead from ActiveRecord objects.

### 3.4 `entity_churn`
- **Current:** Full object instantiation.
- **Optimization:** Use `pluck(:year, :month, id_field)` to perform set operations (entered, exited, retained) on lightweight Ruby arrays.

## 4. Testing Strategy
- **Unit Tests:** Verify that the new optimized queries return identical results to the previous implementation using existing fixtures.
- **Performance Benchmarking:** (Manual) Observe response times for large datasets (e.g., "all years") before and after the change.

## 5. Success Criteria
- Reduction in memory usage for the Rails process during analytics requests.
- Significant decrease in response time for the `year_summary` and `new_vs_catalog` endpoints.
- All indexes successfully applied to the AWS RDS instance.
