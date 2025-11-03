#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "  🧪 RAZORPAY INTEGRATION QUICK TEST"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create a .env file with your Razorpay credentials${NC}"
    echo ""
    echo "Example .env content:"
    echo "RAZORPAY_KEY_ID=rzp_test_..."
    echo "RAZORPAY_KEY_SECRET=..."
    echo ""
    exit 1
fi

# Check if Razorpay keys are set
source .env

if [ -z "$RAZORPAY_KEY_ID" ] || [ "$RAZORPAY_KEY_ID" = "rzp_test_xxxxxxxxxx" ]; then
    echo -e "${RED}❌ Error: Razorpay Key ID not configured${NC}"
    echo -e "${YELLOW}Please add your Test Mode API keys to .env file${NC}"
    echo ""
    echo "Get your keys from:"
    echo -e "${CYAN}https://dashboard.razorpay.com/app/keys${NC}"
    echo ""
    exit 1
fi

if [ -z "$RAZORPAY_KEY_SECRET" ] || [ "$RAZORPAY_KEY_SECRET" = "your_razorpay_key_secret_here" ]; then
    echo -e "${RED}❌ Error: Razorpay Key Secret not configured${NC}"
    echo -e "${YELLOW}Please add your Test Mode API keys to .env file${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Razorpay credentials found${NC}"
echo -e "   Key ID: ${CYAN}$RAZORPAY_KEY_ID${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

echo -e "${BLUE}🚀 Starting backend server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""
echo "=========================================="
echo ""

# Start the server
npm run dev
