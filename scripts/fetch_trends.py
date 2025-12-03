#!/usr/bin/env python3
"""
Python script to fetch Google Trends data for Korea using pytrends
"""
import json
import sys
import traceback
from typing import Any, Dict, List


def log_debug(message: str) -> None:
    """Debug logging to stderr (won't interfere with JSON output)"""
    print(f"[DEBUG] {message}", file=sys.stderr)


def serialize_trends(df) -> List[Dict[str, Any]]:
    """Convert RSS DataFrame into API-friendly JSON"""
    trends: List[Dict[str, Any]] = []

    if df is None:
        log_debug("RSS dataframe is None")
        return trends

    if getattr(df, "empty", True):
        log_debug("RSS dataframe is empty")
        return trends

    for _, row in df.head(10).iterrows():
        title = str(row.get("Title") or row.get("Keyword") or "").strip()
        if not title:
            log_debug("Skipping row without a title")
            continue

        traffic = str(row.get("Traffic", "")).strip()
        link = row.get("Link")
        pub_date = row.get("PubDate")

        trend: Dict[str, Any] = {
            "rank": len(trends) + 1,
            "item": title,
        }

        if traffic:
            trend["traffic"] = traffic
        if link:
            trend["link"] = link
        if pub_date:
            trend["pubDate"] = pub_date

        log_debug(f"Processed trend #{trend['rank']}: {trend['item']}")
        trends.append(trend)

    return trends


def fetch_korean_trends() -> int:
    try:
        log_debug("Starting fetch_korean_trends()")
        log_debug("Attempting to import pytrends.scrape_google_trends_kr...")

        from pytrends.request import scrape_google_trends_kr

        log_debug("pytrends imported successfully")
        log_debug("Fetching daily KR trends via web scraping helper")

        df = scrape_google_trends_kr()
        log_debug(f"Received dataframe type: {type(df)}")

        trends = serialize_trends(df)
        log_debug(f"serialize_trends returned {len(trends)} entries")

        if not trends:
            raise ValueError("No trends found in RSS feed")

        result = {"trends": trends}
        print(json.dumps(result, ensure_ascii=False))
        return 0

    except ImportError as e:
        log_debug(f"ImportError: {str(e)}")
        error_data = {
            "error": "pytrends library not installed. Run: pip install pytrends",
            "trends": [],
            "details": str(e),
        }
        print(json.dumps(error_data, ensure_ascii=False))
        return 1
    except Exception as e:
        log_debug(f"Exception occurred: {str(e)}")
        log_debug(f"Traceback: {traceback.format_exc()}")
        error_data = {
            "error": str(e),
            "trends": [],
            "traceback": traceback.format_exc(),
        }
        print(json.dumps(error_data, ensure_ascii=False))
        return 1

if __name__ == "__main__":
    log_debug("Script started")
    exit_code = fetch_korean_trends()
    log_debug(f"Script finished with exit code: {exit_code}")
    sys.exit(exit_code)

