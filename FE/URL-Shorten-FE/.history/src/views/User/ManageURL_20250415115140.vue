<template>
  <div class="manage-url">
    <h2>Quản lý URL của tôi</h2>

    <!-- List of shortened URLs -->
    <div v-if="urls.length > 0" class="url-list">
      <div v-for="(url, index) in urls" :key="index" class="url-item">
        <div class="url-info">
          <p><strong>URL gốc:</strong> {{ url.originalUrl }}</p>
          <p><strong>Alias:</strong> {{ url.customAlias || 'Không có' }}</p>
          <p><strong>Ngày hết hạn:</strong> {{ url.expiryDate || 'Không có' }}</p>
        </div>
        <div class="url-actions">
          <button @click="deleteUrl(url.userId, url.urlId)">Xóa</button>
        </div>
      </div>
    </div>

    <!-- If no URLs are found -->
    <p v-else>Chưa có URL nào được rút gọn.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // List of URLs
      urls: [],
    };
  },
  created() {
    // Fetch the user's URLs when the component is created
    this.getUserUrls();
  },
  methods: {
    // Fetch URLs from the API
    async getUserUrls() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`http://localhost:5005/api/url/${user.uid}`);
        this.urls = response.data.urls;
      } catch (error) {
        console.error('Error fetching URLs:', error);
      }
    },

    // Delete a URL
    async deleteUrl(userId, urlId) {
      try {
        await axios.delete(`http://localhost:5005/api/url/${userId}/${urlId}`);
        this.urls = this.urls.filter(url => url.urlId !== urlId);
      } catch (error) {
        console.error('Error deleting URL:', error);
      }
    },
  },
};
</script>

<style scoped>
.manage-url {
  padding: 20px;
}

.url-list {
  margin-bottom: 20px;
}

.url-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 5px;
}

.url-info {
  flex: 1;
}

.url-actions button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
}

.url-actions button:hover {
  background-color: #e53935;
}

.url-actions button:focus {
  outline: none;
}

p {
  font-size: 16px;
  color: #333;
}
</style>
