<template>
  <div class="shorten-form">
    <!-- Input field for URL -->
    <input v-model="url"
           type="text"
           placeholder="Paste URL to shorten"
           class="input" />

    <!-- Buttons -->
    <div class="button-group">
      <button @click="shortenUrl" class="button">✂️ SHORTEN</button>
      <button @click="openCustomForm" class="button">🛠️ CUSTOM URL</button>
      <button @click="toggleUploadForm" class="button">🖼️ UPLOAD IMAGE</button>
    </div>

    <!-- Custom URL Form -->
    <div v-if="isCustomFormVisible">
      <CustomURLForm @close="closeCustomForm" @submit="setCustomUrl" />
    </div>

    <!-- Shortened URL Popup -->
    <ShortURLPopup v-if="isPopupVisible"
                   :shortenedLink="shortenedLink"
                   @close="closePopup" />

    <!-- Upload Image Popup -->
    <div v-if="isUploadFormVisible" class="popup-overlay">
      <div class="popup-content">
        <button class="close-button" @click="closeUploadForm">✖</button>
        <UploadImgForm @ocr-success="handleOcrSuccess" @close="closeUploadForm" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import ShortURLPopup from '../views/User/ShortURLPopup.vue';
  import CustomURLForm from './CustomUrlForm.vue';
  import UploadImgForm from './UploadImgForm.vue';
  import UrlService from '../api/UrlService';

  // State
  const url = ref('');
  const customUrl = ref('');
  const isPopupVisible = ref(false);
  const shortenedLink = ref('');
  const isCustomFormVisible = ref(false);
  const isUploadFormVisible = ref(false);

  // Watch để log ra khi popup UploadImgForm mở
  watch(isUploadFormVisible, (newVal) => {
    console.log('[DEBUG] Upload Form Visible:', newVal);
  });

  // Retrieve user info from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.uid;
  const email = user?.email;

  // Shorten URL handler
  const shortenUrl = async () => {
    if (!url.value.trim()) {
      alert('Please enter a URL to shorten!');
      return;
    }

    try {
      const response = await UrlService.shortenUrl(
        url.value,
        customUrl.value || null,
        userId || null,
        email || null,
        null
      );

      shortenedLink.value = response.shortUrl;
      isPopupVisible.value = true;
    } catch (error) {
      console.error('Error shortening URL:', error);
      if (error.response) {
        const errorMessage =
          error.response.data.message ||
          error.response.data.Message ||
          'An error occurred while shortening the URL';
        alert(errorMessage);
      } else {
        alert('Cannot connect to the server');
      }
    }

    url.value = '';
  };

  // Open custom URL form
  const openCustomForm = () => {
    if (!url.value.trim()) {
      alert('Please enter a URL before setting a custom one!');
      return;
    }
    isCustomFormVisible.value = true;
  };

  // Close custom URL form
  const closeCustomForm = () => {
    isCustomFormVisible.value = false;
  };

  // Set custom alias after form submission
  const setCustomUrl = (customAlias) => {
    customUrl.value = customAlias;
    closeCustomForm();
  };

  // Close the popup
  const closePopup = () => {
    isPopupVisible.value = false;
  };

  // Toggle Upload Image popup
  const toggleUploadForm = () => {
  console.log('[DEBUG] Clicked Upload Image button');

  if (!userId || !email) {
    alert('Bạn cần đăng nhập để sử dụng chức năng này!');
    return; // Không mở popup
  }

  isUploadFormVisible.value = true;
};


  // Close Upload Image popup
  const closeUploadForm = () => {
    console.log('[DEBUG] Closed Upload Form');
    isUploadFormVisible.value = false;
  };

  // Handle OCR success event
  const handleOcrSuccess = (ocrData) => {
    if (ocrData?.originalUrl) {
      console.log('[DEBUG] OCR Success, Detected URL:', ocrData.originalUrl);
      url.value = ocrData.originalUrl;
      shortenUrl(); // Auto shorten after OCR
    }
  };
</script>


<style scoped>
  .shorten-form {
    width: 100%;
    max-width: 450px;
    background: rgba(255, 255, 255, 0.3);
    padding: 30px;
    border-radius: 16px;
    backdrop-filter: blur(12px);
    box-shadow: 0px 10px 35px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    transition: all 0.4s ease;
  }

  .input {
    width: 100%;
    padding: 15px;
    font-size: 18px;
    border: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    outline: none;
    transition: all 0.3s ease;
  }

    .input::placeholder {
      color: rgba(255, 255, 255, 0.8);
    }

    .input:focus {
      border-color: #9c27b0;
      box-shadow: 0px 0px 12px rgba(156, 39, 176, 0.6);
    }

  .button-group {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    width: 100%;
  }

  .button {
    width: 48%;
    padding: 16px;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #9c27b0, #6a0dad);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 6px 18px rgba(138, 43, 226, 0.5);
  }

    .button:hover {
      background: linear-gradient(135deg, #7a1fd1, #5a008f);
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(138, 43, 226, 0.7);
    }

    .button:focus {
      outline: none;
    }
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px; /* new: phòng trường hợp nội dung to */
    }

  .popup-content {
    background: white;
    padding: 30px;
    border-radius: 16px;
    width: 100%;
    max-width: 600px; /* tăng lên từ 400px -> 600px */
    min-height: 300px; /* thêm min-height để đẹp */
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    animation: popupFade 0.3s ease; /* thêm animation nhỏ nhẹ */
  }

  @keyframes popupFade {
    from {
      opacity: 0;
      transform: scale(0.9);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 24px;
    font-weight: bold;
    color: #555;
    cursor: pointer;
  }


  .close-button {
    position: absolute;
    top: 10px;
    right: 12px;
    background: transparent;
    border: none;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
  }
</style>
