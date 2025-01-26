#!/bin/bash

# Update package list and upgrade existing packages
echo "Updating package list and upgrading existing packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "Node.js version:"
node --version
echo "npm version:"
npm --version

# Install project dependencies
echo "Installing project dependencies..."
npm install

echo "Installation complete!"

