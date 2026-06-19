import urllib.request
import json
import logging
import datetime
from django.core.cache import cache

logger = logging.getLogger(__name__)

CACHE_KEY = "daily_scripture_verse"
CACHE_TIMEOUT = 86400  # 24 hours

FALLBACK_VERSES = [
    {
        "verse": (
            "Trust in the Lord with all your heart and lean not on your own understanding; "
            "in all your ways submit to him, and he will make your paths straight."
        ),
        "reference": "Proverbs 3:5-6",
        "reflection": (
            "Trusting God means letting go of our own need to control outcomes "
            "and relying on His infinite wisdom."
        )
    },
    {
        "verse": (
            "For I know the plans I have for you, declares the Lord, "
            "plans to prosper you and not to harm you, plans to give you hope and a future."
        ),
        "reference": "Jeremiah 29:11",
        "reflection": "God's intentions for us are always focused on our ultimate spiritual growth and future hope."
    },
    {
        "verse": "I can do all this through him who gives me strength.",
        "reference": "Philippians 4:13",
        "reflection": "Our capacity to endure and thrive comes directly from the strength provided by Christ."
    },
    {
        "verse": (
            "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, "
            "he leads me beside quiet waters, he refreshes my soul."
        ),
        "reference": "Psalm 23:1-3",
        "reflection": "Recognizing God as our shepherd and provider gives us peace, rest, and complete contentment."
    },
    {
        "verse": (
            "But the fruit of the Spirit is love, joy, peace, forbearance, "
            "kindness, goodness, faithfulness, gentleness and self-control."
        ),
        "reference": "Galatians 5:22-23",
        "reflection": "A life aligned with the Holy Spirit naturally produces virtues that bless others and honor God."
    },
    {
        "verse": (
            "Be strong and courageous. Do not be afraid; do not be discouraged, "
            "for the Lord your God will be with you wherever you go."
        ),
        "reference": "Joshua 1:9",
        "reflection": "We can face any challenge with courage because God promises His constant presence."
    },
    {
        "verse": (
            "And we know that in all things God works for the good of "
            "those who love him, who have been called according to his purpose."
        ),
        "reference": "Romans 8:28",
        "reflection": "Even in difficult times, God is orchestrating events for our spiritual growth and good."
    }
]


def get_fallback_verse():
    day_of_year = datetime.date.today().timetuple().tm_yday
    idx = day_of_year % len(FALLBACK_VERSES)
    return FALLBACK_VERSES[idx]


def get_daily_scripture():
    cached_verse = cache.get(CACHE_KEY)
    if cached_verse:
        return cached_verse

    try:
        url = "https://beta.ourmanna.com/api/v1/get/?format=json&order=daily"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            details = data.get("verse", {}).get("details", {})
            text = details.get("text", "").strip()
            reference = details.get("reference", "").strip()

            if text and reference:
                verse_data = {
                    "verse": text,
                    "reference": reference,
                    "reflection": "A daily reminder of God's grace, wisdom, and guidance in our lives."
                }
                cache.set(CACHE_KEY, verse_data, CACHE_TIMEOUT)
                return verse_data
    except Exception as e:
        logger.warning("Failed to fetch daily scripture from OurManna API: %s. Using local fallback.", e)

    # Short 5 minute cache for fallback to avoid spamming the API on every page load
    fallback = get_fallback_verse()
    cache.set(CACHE_KEY, fallback, 300)
    return fallback
