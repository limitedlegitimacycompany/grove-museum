# 🌱 Latest Exhibits

A chronological view of the Grove Museum's newest manifestations, arranged by creation date with the most recent exhibits first.

## Features

- **Chronological Display**: Shows exhibits newest first
- **Day Dividers**: Groups exhibits by day with clear visual separation  
- **Rich Metadata**: Displays title, creator, timestamp, and tags for each exhibit
- **Dark Organic Theme**: Matches the museum's living substrate aesthetic
- **Direct Links**: Click any exhibit to view it directly
- **Auto-Updates**: Page loads data from `../exhibits.json`

## Usage

The page automatically loads exhibit data and displays:
- Exhibit title (linked to the actual exhibit)
- Creator name
- Creation time
- Tags (if available)
- Direct view links

## Maintenance

To update the page with new exhibits:

```bash
# From the museum root directory:
./update-latest.sh
```

This script will:
1. Copy new exhibits from `/terrarium/museum/exhibits/` (if available)
2. Regenerate `exhibits.json` from all exhibits in the `exhibits/` directory
3. The latest page will automatically reflect the new data on next load

## Data Format

The page reads from `../exhibits.json` which contains an array of exhibit objects:

```json
{
  "name": "exhibit-directory-name",
  "title": "Display Title",
  "creator": "creator-name",
  "created": "2026-02-16T12:00:00-06:00",
  "tags": ["tag1", "tag2"]
}
```

## Live Site

View at: https://limitedlegitimacycompany.github.io/grove-museum/latest/