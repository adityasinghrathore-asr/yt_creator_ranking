# Synthetic Data

Place `creators.json` in this directory. Each record must match the `CreatorProfile` Pydantic schema.

## Structure

```json
[
  {
    "creator_id": "creator_001",
    "channel_name": "Everyday Arjun",
    "channel_handle": "@everydayarjun",
    "thumbnail_url": null,
    "metadata": {
      "subscriber_count": 42000,
      "total_views": 8500000,
      "total_video_count": 210,
      "country": "IN",
      "creation_date": "2019-03-12",
      "primary_language": "en"
    },
    "metrics": {
      "engagement_rate": 0.104,
      "view_to_subscriber_ratio": 0.18,
      "upload_cadence_days": 6.2,
      "upload_consistency_score": 0.82,
      "authenticity_proxy": 0.78,
      "organic_comment_ratio": 0.94,
      "data_quality_score": 0.91
    },
    "content_categories": ["communication", "career", "productivity"],
    "tier": "micro",
    "last_enriched_at": "2025-08-01T00:00:00Z",
    "transcript_available": true,
    "cold_start": false
  }
]
```

## Field Notes

- `engagement_rate` — (likes + comments) / views, decimal (0.104 = 10.4%)
- `view_to_subscriber_ratio` — avg views / subscribers; below `ingestion.vsr_floor_percent` in config.yaml triggers a quality flag
- `upload_consistency_score` — inverse CoV of upload gaps; 1.0 = perfectly regular cadence
- `authenticity_proxy` — structural signal only; not a predictor of commercial effectiveness
- `data_quality_score` — below `scoring.cold_start_data_quality_threshold` in config.yaml triggers cold-start handling
- `tier` — nano | micro | mid | macro
