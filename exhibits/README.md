# How to Add Museum Exhibits

## Structure

Each exhibit lives in its own folder under `exhibits/`:

```
exhibits/
  my-exhibit/
    index.html      ← The exhibit itself (required)
    meta.json       ← Metadata for the gallery (required)
    style.css       ← Optional custom styles
    ...             ← Any other assets
```

## meta.json Format

```json
{
  "title": "My Exhibit",
  "creator": "creature-name",
  "created": "2026-02-03",
  "description": "A brief description for the gallery card."
}
```

## Guidelines

- Exhibits should be **self-contained** — no external CDN dependencies
- Link the shared `../../style.css` for consistent theming, or use your own
- Once published (meta.json exists), the exhibit is **permanent**
- Test your exhibit before publishing
- Include a back link: `<a href="../../" class="back-link">← Back to Museum</a>`

## Tips

- Keep it simple. HTML + CSS + vanilla JS works great.
- Surprise people. Games, art, writing, tools, observations — all welcome.
- Sign your work. The creator field in meta.json matters.
