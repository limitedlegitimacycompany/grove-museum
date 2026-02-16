#!/bin/bash
# update-latest.sh - Regenerate the latest exhibits page

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
EXHIBITS_DIR="$REPO_ROOT/exhibits"
TERRARIUM_EXHIBITS="/terrarium/museum/exhibits"

echo "🌱 Updating Grove Museum Latest Exhibits..."

# Step 1: Copy new exhibits from terrarium (if path exists)
if [ -d "$TERRARIUM_EXHIBITS" ]; then
    echo "📂 Copying exhibits from terrarium..."
    
    # Count new exhibits
    NEW_COUNT=0
    for exhibit_dir in "$TERRARIUM_EXHIBITS"/*; do
        if [ -d "$exhibit_dir" ]; then
            exhibit_name=$(basename "$exhibit_dir")
            if [ ! -d "$EXHIBITS_DIR/$exhibit_name" ]; then
                echo "  → New: $exhibit_name"
                cp -r "$exhibit_dir" "$EXHIBITS_DIR/"
                NEW_COUNT=$((NEW_COUNT + 1))
            fi
        fi
    done
    
    echo "✅ Added $NEW_COUNT new exhibits"
else
    echo "⚠️  Terrarium path not found, skipping copy step"
fi

# Step 2: Regenerate exhibits.json from the exhibits directory
echo "📊 Regenerating exhibits.json..."

cat > "$REPO_ROOT/generate-exhibits-json.js" << 'EOF'
const fs = require('fs');
const path = require('path');

const exhibitsDir = path.join(__dirname, 'exhibits');
const outputFile = path.join(__dirname, 'exhibits.json');

function processExhibit(exhibitPath) {
    const exhibitName = path.basename(exhibitPath);
    
    // Skip files, only process directories
    const stat = fs.statSync(exhibitPath);
    if (!stat.isDirectory()) {
        return null;
    }
    
    // Skip dotfiles
    if (exhibitName.startsWith('.')) {
        return null;
    }
    
    let title = exhibitName;
    let creator = 'unknown';
    let tags = [];
    let created = null;
    
    // Try to read meta.json
    const metaPath = path.join(exhibitPath, 'meta.json');
    if (fs.existsSync(metaPath)) {
        try {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            title = meta.title || title;
            creator = meta.creator || creator;
            tags = meta.tags || tags;
            created = meta.created || null;
        } catch (e) {
            console.warn(`Warning: Could not parse meta.json for ${exhibitName}:`, e.message);
        }
    }
    
    // If no created date in meta, use directory modification time
    if (!created) {
        created = stat.mtime.toISOString();
    }
    
    // If created is just a date (YYYY-MM-DD), convert to ISO string
    if (created && !created.includes('T')) {
        created = new Date(created + 'T12:00:00').toISOString();
    }
    
    return {
        name: exhibitName,
        title: title,
        creator: creator,
        created: created,
        tags: tags
    };
}

function main() {
    console.log('Scanning exhibits directory...');
    
    if (!fs.existsSync(exhibitsDir)) {
        console.error('Exhibits directory not found:', exhibitsDir);
        process.exit(1);
    }
    
    const exhibitItems = fs.readdirSync(exhibitsDir);
    const exhibits = [];
    
    for (const item of exhibitItems) {
        const itemPath = path.join(exhibitsDir, item);
        const exhibit = processExhibit(itemPath);
        if (exhibit) {
            exhibits.push(exhibit);
        }
    }
    
    // Sort by creation date, newest first
    exhibits.sort((a, b) => {
        if (!a.created && !b.created) return 0;
        if (!a.created) return 1;
        if (!b.created) return -1;
        return new Date(b.created) - new Date(a.created);
    });
    
    console.log(`Found ${exhibits.length} valid exhibits`);
    
    // Write exhibits.json
    fs.writeFileSync(outputFile, JSON.stringify(exhibits, null, 2));
    console.log(`✅ Written to ${outputFile}`);
    
    // Show some stats
    const creators = [...new Set(exhibits.map(e => e.creator))];
    const withDates = exhibits.filter(e => e.created).length;
    
    console.log(`📈 Stats:`);
    console.log(`   ${exhibits.length} total exhibits`);
    console.log(`   ${withDates} with creation dates`);
    console.log(`   ${creators.length} unique creators: ${creators.join(', ')}`);
}

main();
EOF

# Run the Node.js script
node "$REPO_ROOT/generate-exhibits-json.js"

# Clean up the temporary script
rm "$REPO_ROOT/generate-exhibits-json.js"

echo "🎨 Latest exhibits page is ready at: /latest/"
echo "🌍 Live site: https://limitedlegitimacycompany.github.io/grove-museum/latest/"

# Optional: Open in browser if running locally
if command -v xdg-open > /dev/null 2>&1; then
    echo "🔗 Opening in browser..."
    xdg-open "file://$REPO_ROOT/latest/index.html" 2>/dev/null || true
fi

echo "✨ Update complete!"