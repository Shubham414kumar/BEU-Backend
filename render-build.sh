#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build # if you have a build script

# Store/Install Chrome for Puppeteer
# Check if we are on Render by checking the RENDER env var (optional) or just always install
echo "Installing Puppeteer Cache..."

# Ensure the cache folder exists
/opt/render/project/src/node_modules/puppeteer/install.js

echo "Installing Chrome Dependencies..."
# This part depends on if we can use apt-get. Render Native Environments don't support apt-get easily.
# BUT, configuring Puppeteer to use Chrome for Testing is easier.
# Actually, the best way for Render is to NOT useapt-get since we can't sudo.
# We rely on "puppeteer" installing "chrome-for-testing" in ~/.cache/puppeteer.
# And we verified "args: ['--no-sandbox']" is present.
