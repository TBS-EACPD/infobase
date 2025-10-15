#!/bin/bash

# Script to download the latest si.csv and ss.csv files from GitHub releases
# and replace the local copies in the data directory
#
# This script:
# 1. Fetches the latest release from gcperformance/service-data repository
# 2. Downloads files with exact names: si.csv and ss.csv (no date prefixes)
# 3. Removes timestamp lines from the downloaded files
# 4. Replaces the local files with the cleaned versions
# 5. Provides status information throughout the process
#
# Usage: npm run download_service_data
# Or: sh scripts/dev_scripts/download_service_data.sh


set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="gcperformance"
REPO_NAME="service-data"
DATA_DIR="data"
TEMP_DIR="/tmp/infobase_service_data"

# Function to print colored output
print_status() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

print_warning() {
    printf "${YELLOW}[WARNING]${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

# Function to check if required tools are available
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed. Please install jq to parse JSON responses"
        exit 1
    fi
    
    print_status "All dependencies are available"
}

# Function to get the latest release info
get_latest_release() {
    print_status "Fetching latest release information..."
    
    local api_url="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest"
    local response_file="$TEMP_DIR/release_data.json"
    
    # Create temporary directory
    mkdir -p "$TEMP_DIR"
    
    # Fetch the release data
    if ! curl -s "$api_url" -o "$response_file"; then
        print_error "Failed to fetch release information"
        exit 1
    fi
    
    # Check if the response contains an error
    if jq -e '.message' "$response_file" > /dev/null 2>&1; then
        print_error "GitHub API error: $(jq -r '.message' "$response_file")"
        exit 1
    fi
    
    # Extract release info
    local tag_name=$(jq -r '.tag_name' "$response_file")
    local published_at=$(jq -r '.published_at' "$response_file")
    
    print_status "Latest release: $tag_name (published: $published_at)"
}

# Function to find and download CSV files
download_csv_files() {
    local release_data_file="$1"
    
    print_status "Looking for exact filename matches: si.csv and ss.csv..."
    
    # Debug: Check if release_data_file is valid JSON
    if ! jq empty "$release_data_file" 2>/dev/null; then
        print_error "Invalid JSON response from GitHub API"
        print_error "Response: $(head -5 "$release_data_file")"
        exit 1
    fi
    
    # Create temporary directory
    mkdir -p "$TEMP_DIR"
    
    # Get asset URLs for si.csv and ss.csv files (exact name match only)
    local si_url=$(jq -r '.assets[] | select(.name == "si.csv") | .browser_download_url' "$release_data_file")
    local ss_url=$(jq -r '.assets[] | select(.name == "ss.csv") | .browser_download_url' "$release_data_file")
    
    if [ -z "$si_url" ] || [ "$si_url" = "null" ]; then
        print_error "Could not find si.csv file in the latest release"
        exit 1
    fi
    
    if [ -z "$ss_url" ] || [ "$ss_url" = "null" ]; then
        print_error "Could not find ss.csv file in the latest release"
        exit 1
    fi
    
    print_status "Found si.csv: $(jq -r '.assets[] | select(.name == "si.csv") | .name' "$release_data_file")"
    print_status "Found ss.csv: $(jq -r '.assets[] | select(.name == "ss.csv") | .name' "$release_data_file")"
    
    # Download si.csv
    print_status "Downloading si.csv..."
    if curl -L -o "$TEMP_DIR/si.csv" "$si_url"; then
        print_status "Successfully downloaded si.csv"
    else
        print_error "Failed to download si.csv"
        exit 1
    fi
    
    # Download ss.csv
    print_status "Downloading ss.csv..."
    if curl -L -o "$TEMP_DIR/ss.csv" "$ss_url"; then
        print_status "Successfully downloaded ss.csv"
    else
        print_error "Failed to download ss.csv"
        exit 1
    fi
    
    # Remove timestamp lines from both files
    print_status "Removing timestamp lines from CSV files..."
    
    # Remove timestamp line from si.csv (last line if it starts with "Timestamp:")
    if tail -1 "$TEMP_DIR/si.csv" | grep -q "^Timestamp:"; then
        sed '$d' "$TEMP_DIR/si.csv" > "$TEMP_DIR/si_temp.csv" && mv "$TEMP_DIR/si_temp.csv" "$TEMP_DIR/si.csv"
        print_status "Removed timestamp line from si.csv"
    fi
    
    # Remove timestamp line from ss.csv (last line if it starts with "Timestamp:")
    if tail -1 "$TEMP_DIR/ss.csv" | grep -q "^Timestamp:"; then
        sed '$d' "$TEMP_DIR/ss.csv" > "$TEMP_DIR/ss_temp.csv" && mv "$TEMP_DIR/ss_temp.csv" "$TEMP_DIR/ss.csv"
        print_status "Removed timestamp line from ss.csv"
    fi
}

# Function to replace local files
replace_local_files() {
    print_status "Replacing local CSV files..."
    
    # Check if data directory exists
    if [ ! -d "$DATA_DIR" ]; then
        print_error "Data directory '$DATA_DIR' does not exist"
        exit 1
    fi
    
    # Replace the files
    if cp "$TEMP_DIR/si.csv" "$DATA_DIR/si.csv"; then
        print_status "Successfully replaced si.csv"
    else
        print_error "Failed to replace si.csv"
        exit 1
    fi
    
    if cp "$TEMP_DIR/ss.csv" "$DATA_DIR/ss.csv"; then
        print_status "Successfully replaced ss.csv"
    else
        print_error "Failed to replace ss.csv"
        exit 1
    fi
}

# Function to cleanup temporary files
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}

# Function to show file information
show_file_info() {
    print_status "File information:"
    echo "  si.csv: $(wc -l < "$DATA_DIR/si.csv") lines, $(du -h "$DATA_DIR/si.csv" | cut -f1)"
    echo "  ss.csv: $(wc -l < "$DATA_DIR/ss.csv") lines, $(du -h "$DATA_DIR/ss.csv" | cut -f1)"
}

# Main execution
main() {
    print_status "Starting service data download..."
    print_status "Repository: ${REPO_OWNER}/${REPO_NAME}"
    print_status "Target directory: $DATA_DIR"
    
    # Check dependencies
    check_dependencies
    
    # Get latest release
    get_latest_release
    local release_data_file="$TEMP_DIR/release_data.json"
    
    # Download CSV files
    download_csv_files "$release_data_file"
    
    # Replace local files
    replace_local_files
    
    # Show file information
    show_file_info
    
    # Cleanup
    cleanup
    
    print_status "Service data download completed successfully!"
}

# Run main function
main "$@"
