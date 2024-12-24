from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routers import upc_router, terapeak_router, listing_optimizer_router

# Load environment variables
load_dotenv()

app = FastAPI(title="AIMagic eBay Lister")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upc_router.router)
app.include_router(terapeak_router.router)
app.include_router(listing_optimizer_router.router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "AIMagic eBay Lister"}

# New endpoint
@app.get("/")
async def root():
    return {"message": "AI Magic Lister API"}
