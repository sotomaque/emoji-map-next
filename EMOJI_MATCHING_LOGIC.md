# Emoji Matching Logic

This document describes the logic used to match places with emojis in the emoji-map application.

## Overview

The emoji matching system uses a sophisticated scoring mechanism to determine the most appropriate emoji for a place. It considers multiple data points from both the Google Places API response and our predefined category mappings.

## Data Sources

### From Google Places API
- `types`: Array of place types (e.g., ["restaurant", "food", "point_of_interest"])
- `displayName.text`: The place's display name (e.g., "McDonald's")

### From Category Map
- `examples`: Array of example place names that should match this category
- `primaryType`: Array of primary Google Place types for this category
- `keywords`: Array of keywords that indicate this category
- `emoji`: The emoji to use for this category

## Matching Process

The matching process follows a strict priority order:

1. **Exact Example Matches (Highest Priority)**
   - Checks for exact matches between the place's display name and category examples
   - Case-insensitive and normalized (removes apostrophes, extra spaces)
   - If found, immediately returns that category's emoji
   - This acts as an override mechanism for specific cases

2. **Scoring System (For Non-Exact Matches)**
   Each category receives points based on multiple criteria:

   | Match Type | Points | Description |
   |------------|--------|-------------|
   | Primary Type Base Match | 5 points | Having any primary type match |
   | Additional Primary Types | 2 points each | For each additional matching primary type |
   | Exact Word Match | 4 points each | When a word in the place name exactly matches a category keyword |
   | General Keyword Match | 2 points each | When a place's type or name contains a category's keyword |
   | Partial Name Match | 3 points each | When a place's name partially matches a category example |
   | Generic Category Penalty | -2 points | Applied to generic categories (e.g., 'Food') when only matching by type |

3. **Tiebreaker Rules**
   - When scores are equal, categories with primary type matches are prioritized
   - If still tied, the first category in the list is used

4. **Normalization**
   All text matching is done with normalized strings:
   - Converted to lowercase
   - Trimmed of whitespace
   - Apostrophes removed
   - Multiple spaces replaced with single spaces
   - Words are split for exact word matching

## Scoring Example

For a place like "Burrito Factory":
```typescript
{
  displayName: { text: "Burrito Factory" },
  types: ["restaurant", "food", "point_of_interest"]
}
```

Category scoring might look like:
```typescript
{
  mexican: {
    score: 11,
    matches: {
      primaryTypes: ["mexican_restaurant"],  // 5 points base
      keywords: ["restaurant", "food"],      // 4 points (2 each)
      exactWordMatches: ["burrito"],         // 4 points
      nameMatches: []                        // 0 points
    }
  },
  restaurant: {
    score: 7,
    matches: {
      primaryTypes: ["restaurant"],          // 5 points base
      keywords: ["restaurant", "food"],      // 4 points (2 each)
      exactWordMatches: [],                  // 0 points
      nameMatches: [],                       // 0 points
      genericPenalty: true                   // -2 points
    }
  }
}
```

## Fallback Behavior

- If no matches are found or all categories score 0, returns default emoji (🍽️)
- Otherwise, returns the emoji from the highest-scoring category
- In case of a tie, prioritizes categories with primary type matches

## Debug Logging

The system includes extensive debug logging:
- Input data (place types, name)
- Exact match attempts
- Scoring details for each category
- Final selection reasoning

Example debug log:
```typescript
{
  "scores": [
    {
      "category": "Mexican Food",
      "emoji": "🌮",
      "score": 11,
      "matches": {
        "primaryTypes": ["mexican_restaurant"],
        "keywords": ["restaurant", "food"],
        "exactWordMatches": ["burrito"],
        "nameMatches": []
      }
    }
  ]
}
```

## Common Matching Issues and Troubleshooting

### Mediterranean Restaurant Example

Consider a Mediterranean restaurant with this data:
```typescript
{
  "displayName": { "text": "Beeside Balcony" },
  "types": [
    "mediterranean_restaurant",
    "restaurant",
    "food",
    "point_of_interest",
    "establishment"
  ]
}
```

This should match category 39 (🥙 Mediterranean) as it has the primary type "mediterranean_restaurant". 
However, it might get the default emoji (🍽️) instead due to:

1. **No word matching in name**: "Beeside Balcony" doesn't contain any Mediterranean keywords (gyro, hummus, etc.)
2. **Competition with the generic food category**: The generic food category (key: 25) includes "restaurant" and "food" in its primaryType, which are also present in the place's types.

#### Troubleshooting:

To fix Mediterranean restaurant matching, options include:
- Update the restaurant name in examples if it's a common chain
- Add more relevant keywords to the Mediterranean category
- Ensure the log.debug statements are enabled to view scoring breakdown

### Other Common Issues

1. **Incorrect primary type**: Some Google Places API types may not match our expected primaryType values
2. **Multiple applicable categories**: Places with multiple types (e.g., "restaurant" and "bar") may match multiple categories
3. **Generic names**: Places with generic names require stronger type matching

## Implementation

The matching logic is implemented in the `findBestMatchingEmoji` function in `src/app/api/places/search/route.ts`. The function takes:
- `placeTypes`: Array of place types from Google Places API
- `selectedKeys`: Array of category keys to consider (optional)
- `placeName`: The place's display name (optional)

```typescript
// Key portion of the implementation
if (categoryScores.length > 0 && categoryScores[0].score > 0) {
  const bestMatch = categoryScores[0];
  return bestMatch.category.emoji;
}

// If no matches found, return default emoji
return DEFAULT_EMOJI;
```

## Future Improvements

Potential areas for enhancement:
1. Machine learning-based matching using historical data
2. User feedback system to improve matches
3. Location-based context for better matching
4. Support for multiple emojis per place
5. Customizable scoring weights
6. Enhanced handling of compound words and phrases
7. Integration with business category data from additional sources
8. Localization support for international place names and categories
9. Prioritize primaryType matches more strongly to ensure specific types like "mediterranean_restaurant" override generic "restaurant" types
10. Implement custom override rules for special cases 