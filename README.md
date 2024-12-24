# AI Magic Lister

An AI-powered eBay listing automation tool that helps you create optimized listings from UPC scans.

## Features

- UPC barcode scanning for product identification
- AI-powered listing optimization using Google's Gemini
- Automatic eBay draft listing creation
- Specialized support for Funko Pop listings
- Market price analysis and recommendations

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a .env file with your API keys:
```
EBAY_APP_ID=your_app_id
EBAY_CERT_ID=your_cert_id
EBAY_DEV_ID=your_dev_id
EBAY_AUTH_TOKEN=your_auth_token
GOOGLE_API_KEY=your_google_api_key
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Create a .env file with your API configuration:
```
REACT_APP_EBAY_API_URL=https://api.ebay.com/ws/api.dll
REACT_APP_EBAY_AUTH_TOKEN=your_ebay_auth_token
REACT_APP_EBAY_APP_ID=your_ebay_app_id
```

4. Start the frontend development server:
```bash
npm start
```

## Usage

1. Open the application in your browser
2. Scan a Funko Pop UPC code using your camera
3. Review and edit the automatically populated product details
4. Click "Create eBay Listing" to generate a draft listing
5. Review the draft in your eBay account before publishing

## Technologies Used

- Frontend: React, Material-UI, TypeScript
- Backend: FastAPI, Python
- AI: Google Gemini
- APIs: eBay Trading API, eBay Finding API
