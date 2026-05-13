<template>
  <div class="ocr-uploader">
    <h2 class="title">Shorten URL from Image</h2>

    <div class="form-group">
      <input type="file"
             @change="handleFileChange"
             accept="image/*"
             class="file-input"
             :disabled="isLoading" />
    </div>

    <div class="form-group">
      <button @click="uploadAndShorten"
              :disabled="!selectedFile || isLoading"
              class="upload-btn">
        {{ isLoading ? 'Processing...' : 'Upload and Shorten' }}
      </button>
    </div>

    <div v-if="ocrResult" class="result success">
      <h4>Success!</h4>
      <p><strong>Original (Detected):</strong> {{ ocrResult.originalUrl }}</p>
      <p>
        <strong>Short URL:</strong>
        <a :href="ocrResult.shortUrl" target="_blank">{{ ocrResult.shortUrl }}</a>
      </p>
    </div>

    <div v-if="ocrError" class="result error">
      <h4>Error</h4>
      <p>{{ ocrError }}</p>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import urlService from '../api/UrlService';

  const selectedFile = ref(null);
  const isLoading = ref(false);
  const ocrResult = ref(null);
  const ocrError = ref(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      selectedFile.value = file;
      ocrResult.value = null;
      ocrError.value = null;
    } else {
      selectedFile.value = null;
    }
  };

  const uploadAndShorten = async () => {
    if (!selectedFile.value) return;

    isLoading.value = true;
    ocrResult.value = null;
    ocrError.value = null;

    try {
      const result = await urlService.uploadImageForOcr(selectedFile.value);
      ocrResult.value = result;
    } catch (error) {
      console.error("Error uploading image:", error);

      if (error.response?.status === 400) {
        alert('Invalid Image: No valid URL detected.');
        ocrError.value = "Invalid image or no URL detected.";
      } else {
        ocrError.value = error.message || "An unknown error occurred.";
      }

      if (error.message?.includes("401") || error.message?.includes("token")) {
        console.error("Authentication error during OCR, potentially logged out.");
      }
    } finally {
      isLoading.value = false;
      selectedFile.value = null;
    }
  };
</script>

<style scoped>
  .ocr-uploader {
    width: 100%;
    max-width: 400px; /* Giới hạn form tối đa 400px */
    margin: 40px auto; /* Căn giữa */
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0,0,0,0.05);
  }

  .title {
    font-size: 22px;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
  }

  .form-group {
    margin-bottom: 15px;
    text-align: center;
  }

  .file-input {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    background: white;
    border: 1px solid #ccc;
  }

  .upload-btn {
    padding: 10px 25px;
    font-size: 16px;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

    .upload-btn:disabled {
      background-color: #90caf9;
      cursor: not-allowed;
    }

  .result {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
  }

  .success {
    background-color: #e8f5e9;
    border: 1px solid #4caf50;
    color: #2e7d32;
  }

  .error {
    background-color: #ffebee;
    border: 1px solid #e53935;
    color: #c62828;
  }

  a {
    color: #1976d2;
    text-decoration: underline;
  }
</style>
