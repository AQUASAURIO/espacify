#!/bin/bash
# Espacify APK Build Script
# This script builds the web app and packages it as an Android APK using Capacitor

set -e

echo "🏗️  Espacify APK Build Script"
echo "============================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Build the Next.js app
echo ""
echo -e "${YELLOW}Step 1: Building Next.js application...${NC}"
bun run build
echo -e "${GREEN}✓ Next.js build complete${NC}"

# Step 2: Add Android platform
echo ""
echo -e "${YELLOW}Step 2: Adding Android platform...${NC}"
npx cap add android 2>/dev/null || echo "Android platform already exists"
echo -e "${GREEN}✓ Android platform ready${NC}"

# Step 3: Sync web assets to native
echo ""
echo -e "${YELLOW}Step 3: Syncing web assets...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Assets synced${NC}"

# Step 4: Open Android Studio (for building APK)
echo ""
echo -e "${GREEN}Step 4: Build APK${NC}"
echo ""
echo "To build the APK:"
echo "  1. Open Android Studio: npx cap open android"
echo "  2. Go to Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "  3. The APK will be at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo -e "${YELLOW}OR build from command line:${NC}"
echo "  cd android && ./gradlew assembleDebug"
echo ""
echo -e "${GREEN}✓ APK build instructions ready${NC}"
echo ""
echo "For production release:"
echo "  1. Generate a keystore: keytool -genkey -v -keystore espacify.keystore"
echo "  2. Configure signing in android/app/build.gradle"
echo "  3. Build release: cd android && ./gradlew assembleRelease"
echo ""
echo "📱 The APK will install on Android devices and run Espacify as a native app!"
