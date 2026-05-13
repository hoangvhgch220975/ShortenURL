import os
from io import BytesIO
import re
import httpx  # HTTP client library, better for async
import validators  # URL validation library

import easyocr
import imagehash
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger
from PIL import Image

# --- Configuration ---
OCR_CONFIDENCE_THRESHOLD = 0.0
# Get the API Gateway URL from environment variables, defaulting to internal port 80
URL_SHORTENER_ENDPOINT = f"{os.getenv('URL_SHORTENER_SERVICE_URL', 'http://api-gateway:80')}/api/url/shorten"

# --- Initialize EasyOCR Reader (Preload) ---
logger.info("Loading EasyOCR model...")
try:
    # Try to use GPU if available, fallback to CPU otherwise
    reader = easyocr.Reader(
        ["vi", "en"],
        gpu=False,  # Default is False; set to True if GPU is available and configured
        detect_network="craft",
        model_storage_directory="/app/my_model",  # Model storage path inside the container
        download_enabled=False,  # Model files should already exist
    )
    logger.info("EasyOCR model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load EasyOCR model: {e}")
    # Optionally, you could terminate the app if model loading is critical
    # raise e

# --- FastAPI App ---
app = FastAPI()
security = HTTPBearer()  # Used to extract Authorization token from headers

# --- Helper Functions ---
def find_first_valid_url(detections):
    """Find the first valid URL from OCR detections with confidence >= threshold."""
    potential_urls = []
    for bbox, text, prob in detections:
        if prob >= OCR_CONFIDENCE_THRESHOLD:
            # Simple regex to detect URL-like strings
            if re.match(r'^https?://[^\s/$.?#].[^\s]*$', text.strip(), re.IGNORECASE):
                potential_urls.append({"url": text.strip(), "prob": prob})

    if not potential_urls:
        return None

    # Sort by probability descending and pick the first
    potential_urls.sort(key=lambda x: x['prob'], reverse=True)

    # Validate using validators library
    for item in potential_urls:
        if validators.url(item['url']):
            logger.info(f"Validated URL found: {item['url']} (Confidence: {item['prob']})")
            return item['url']
        else:
            logger.warning(f"Potential URL failed validation: {item['url']}")

    logger.warning("No valid URL found after validation.")
    return None

# --- API Endpoints ---
@app.post("/api/ocr/upload")
async def upload_and_shorten(
    request: Request,
    file: UploadFile = File(...),
    auth: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Receive an image, extract a URL via OCR, and call the UrlShortener service to generate a shortened link.
    Requires 'Authorization: Bearer {token}' header.
    """
    logger.info(f"Received OCR request for file: {file.filename}")

    # Read the uploaded image
    try:
        request_object_content = await file.read()
        pil_image = Image.open(BytesIO(request_object_content))
        # Convert to RGB if image is RGBA or P mode to avoid EasyOCR errors
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

        # Log all detected text
        for idx, (bbox, text, prob) in enumerate(detection):
            logger.info(f"[Block {idx+1}] Text: {text} | Confidence: {prob:.2f}")

    except Exception as e:
        logger.error(f"EasyOCR failed: {e}")
        raise HTTPException(status_code=500, detail="OCR processing failed.")

    # Find the first valid URL
    extracted_url = find_first_valid_url(detection)

    if not extracted_url:
        logger.warning(f"No valid URL found with confidence >= {OCR_CONFIDENCE_THRESHOLD}")
        raise HTTPException(status_code=400, detail=f"No valid URL found with sufficient confidence (>= {OCR_CONFIDENCE_THRESHOLD}).")

    # Call the UrlShortener service (via Gateway)
    logger.info(f"Calling UrlShortener for URL: {extracted_url}")
    headers = {
        "Authorization": f"Bearer {auth.credentials}",
        "Content-Type": "application/json"
    }
    payload = {
        "url": extracted_url
        # No customAlias or expiryDate sent — defaults will be used
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(URL_SHORTENER_ENDPOINT, json=payload, headers=headers)
            response.raise_for_status()  # Raise error if not a 2xx response
            shortener_response = response.json()
            logger.info(f"UrlShortener responded successfully: {shortener_response}")
            return shortener_response
    except httpx.HTTPStatusError as exc:
        # Error from UrlShortener or Gateway
        error_detail = f"UrlShortener service returned error: {exc.response.status_code}"
        try:
            error_body = exc.response.json()
            error_detail += f" - {error_body.get('message', exc.response.text)}"
        except ValueError:
            error_detail += f" - {exc.response.text}"
        logger.error(error_detail)
        raise HTTPException(status_code=exc.response.status_code, detail=error_detail)
    except httpx.RequestError as exc:
        logger.error(f"Could not connect to UrlShortener service: {exc}")
        raise HTTPException(status_code=503, detail=f"Could not reach UrlShortener service: {exc}")
    except Exception as e:
        logger.error(f"Unexpected error calling UrlShortener: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while shortening the URL.")

@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}

# (Optional) Keep /preloaded_ocr endpoint for OCR-only testing
# @app.post("/preloaded_ocr_test")
# async def ocr_test(file: UploadFile = File(...)):
#     ... (OCR logic similar to main endpoint) ...
