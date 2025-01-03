#!/bin/bash

# Define directories and target file paths
pnpm build 

SOURCE_DIR="./dist/assets"
DEST_JS="/var/www/html/meccain.com/wp-content/uploads/dist-main.js"
DEST_CSS="/var/www/html/meccain.com/wp-content/uploads/dist-main.css"

# Check and copy the JavaScript file
JS_FILE=$(find "$SOURCE_DIR" -type f -name "*.js" | head -n 1)
if [[ -n "$JS_FILE" ]]; then
    cp "$JS_FILE" "$DEST_JS"
else
    echo "No JavaScript file found in $SOURCE_DIR"
fi

# Check and copy the CSS file
CSS_FILE=$(find "$SOURCE_DIR" -type f -name "*.css" | head -n 1)
if [[ -n "$CSS_FILE" ]]; then
    cp "$CSS_FILE" "$DEST_CSS"
else
    echo "No CSS file found in $SOURCE_DIR"
fi

cp dist/* -r /var/www/html/ico.meccain.com/

echo "Deployed"
