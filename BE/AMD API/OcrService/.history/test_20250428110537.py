import os
from io import BytesIO
import re
import httpx # Better HTTP client library than requests for async
import validators # URL checking library

import easyocr
import imagehash
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger
from PIL import Image

# --- Configuration ---
OCR_CONFIDENCE_THRESHOLD = 0.0
# Get API Gateway URL from environment variable, point to local port 80
URL_SHORTENER_ENDPOINT = f"{os.getenv('URL_SHORTENER_SERVICE_URL', 'http://api-gateway:80')}/api/url/shorten"

# --- Initialize EasyOCR Reader (Preload) ---
logger.info("Loading EasyOCR model...")
try:
# Try using GPU if available, otherwise fallback to CPU
# Need to check Dockerfile and host environment for CUDA support
reader = easyocr.Reader(
["vi", "en"],
gpu=False, # Default is False, change to True if GPU is available and installed correctly
detect_network="craft",
model_storage_directory="/app/my_model",
# Path in container
download_enabled=False, # Model already available in image
)
logger.info("EasyOCR model loaded successfully.")
except Exception as e:
logger.error(f"Failed to load EasyOCR model: {e}")
# Can exit app or operate in restricted mode if model is required
# raise e # Exit if model fails to load

# --- FastAPI App ---
app = FastAPI()
security = HTTPBearer() # To get token from header Authorization

# --- Helper Functions ---
def find_first_valid_url(detections):
"""Find the first valid URL from the OCR results with confidence >= threshold."""
potential_urls = []
for bbox, text, prob in detections:
if prob >= OCR_CONFIDENCE_THRESHOLD:
# Simple regex to find URL-like strings
# This regex may need improvement
if re.match(r'^https?://[^\s/$.?#].[^\s]*$', text.strip(), re.IGNORECASE):
potential_urls.append({"url": text.strip(), "prob": prob})

if not potential_urls:
return None

# Sort by descending probability and return the first URL
potential_urls.sort(key=lambda x: x['prob'], reverse=True)

# Check again with validators library
for item in potential_urls:
if validators.url(item['url']):
logger.info(f"Validated URL found: {item['url']} (Prob: {item['prob']})")
return item['url']
else:
logger.warning(f"Potential URL failed validation: {item['url']}")

logger.warning("No valid URL found after validation.")
return None

# --- API Endpoints ---
@app.post("/api/ocr/upload")
async def upload_and_shorten(
request: Request, # Add Request to access header
file: UploadFile = File(...),
# Get authentication information from Authorization header
auth: HTTPAuthorizationCredentials = Depends(security)
):
"""
Get image, extract URL, and call UrlShortener service to create link shortened.
Requires header 'Authorization: Bearer {token}'.
""" 
logger.info(f"Received OCR request for file: {file.filename}") 

# Read photos 
try: 
request_object_content = await file.read() 
pil_image = Image.open(BytesIO(request_object_content)) 
# Switch to RGB if RGBA or P to avoid EasyOCR errors 
if pil_image.mode in ('RGBA', 'P'): 
pil_image = pil_image.convert('RGB') 
np_image = np.array(pil_image) 
except Exception as e: 
logger.error(f"Failed to read or process image: {e}") 
raise HTTPException(status_code=400, detail="Invalid or corrupted image file.") 

# Perform OCR 
try: 
logger.info("Performing OCR...") 
detection = reader.readtext(np_image) 
logger.info(f"OCR detected {len(detection)} text blocks.") 
# Print all readable text 
for idx, (bbox, text, prob) in enumerate(detection): 
logger.info(f"[Block {idx+1}] Text: {text} | Confidence: {prob:.2f}") 
except Exception as e: 
logger.error(f"EasyOCR failed: {e}") 
raise HTTPException(status_code=500, detail="OCR processing failed.") 

# Find the first valid URL with high confidence 
extracted_url = find_first_valid_url(detection) 

if not extracted_url: 
logger.warning(f"No valid URL found with confidence >= {OCR_CONFIDENCE_THRESHOLD}") 
raise HTTPException(status_code=400, detail=f"No valid URL found with sufficient confidence (>= {OCR_CONFIDENCE_THRESHOLD}).")

# Call UrlShortener service (via Gateway)
logger.info(f"Calling UrlShortener for URL: {extracted_url}")
headers = {
# Forward user authentication token
"Authorization": f"Bearer {auth.credentials}",
"Content-Type": "application/json"
}
payload = {
"url": extracted_url
# Do not send customAlias ​​and expiryDate to use UrlShortener default
}

try:
async with httpx.AsyncClient() as client:
response