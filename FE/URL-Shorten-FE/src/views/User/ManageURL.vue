<template>
  <div class="manage-url">
    <h2 class="heading">📂 My Shortened URLs</h2>

    <div v-if="urls.length > 0" class="table-container">
      <table class="url-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Original</th>
            <th>Short URL</th>
            <th>Clicks</th>
            <th>Created At</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(url, index) in urls" :key="index">
            <td>{{ index + 1 }}</td>
            <td class="wrap">{{ url.originalUrl }}</td>
            <td class="wrap">
              <a :href="url.shortUrl" target="_blank">{{ url.shortUrl }}</a>
            </td>
            <td>{{ url.clickCount }}</td>
            <td>{{ formatDate(url.createdAt) }}</td>
            <td>
              <span v-if="url.expiryDate">
                <span v-if="isExpired(url.expiryDate)" style="color: red; font-weight: bold;">Expired</span>
                <span v-else>{{ formatDate(url.expiryDate) }}</span>
              </span>
              <span v-else>None</span>
            </td>
            <td>
              <div class="action-group-vertical">
                <button @click="showQr(url.shortUrl)" class="action-btn">See QR</button>
                <button @click="deleteUrl(url.shortUrl)" class="action-btn delete">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="no-url">No shortened URLs found.</p>

    <QrPopup v-if="showQrModal"
             :shortenedLink="selectedLink"
             @close="showQrModal = false" />
  </div>
</template>

<script>
  import urlService from '@/api/UrlService';
  import QrPopup from '@/views/User/QrPopup.vue';

  export default {
    components: { QrPopup },
    data() {
      return {
        urls: [],
        showQrModal: false,
        selectedLink: ''
      };
    },
    async created() {
      await this.fetchUserUrls();
    },
    methods: {
      async fetchUserUrls() {
        try {
          const urls = await urlService.getUserUrls();
          this.urls = (urls || []).filter(u => u.originalUrl);
          console.log('Fetched URLs:', urls);
        } catch (err) {
          console.error('Error fetching URLs:', err);
        }
      },
      formatDate(datetime) {
        if (!datetime) return 'None';
        return new Date(datetime).toLocaleString();
      },
      isExpired(date) {
        if (!date) return false;
        return new Date(date) < new Date();
      },

      showQr(shortUrl) {
        this.selectedLink = shortUrl;
        this.showQrModal = true;
      },
      async deleteUrl(shortUrl) {
        if (!confirm('Are you sure you want to delete this URL?')) return;

        try {
          await urlService.deleteUrl(shortUrl);
          this.urls = this.urls.filter(url => url.shortUrl !== shortUrl);
          console.log('Deleted URL with alias:', shortUrl);
        } catch (err) {
          console.error('Failed to delete URL:', err);
          alert('Failed to delete URL. Please try again.');
        }
      }
    }
  };
</script>
<style scoped>
  .manage-url {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #fff;
  }

  .heading {
      text-align: center;
      font-size: 28px;
      margin-bottom: 30px;
      color: #f1f1f1;
  }

  .table-container {
      overflow-x: auto;
      background-color: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(4px);
  }

  .url-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
      color: #f1f1f1;
  }

    .url-table thead {
        background-color: rgba(255, 255, 255, 0.07);
        color: #fff;
    }

    .url-table th {
        padding: 14px 18px;
        text-align: left;
        font-weight: 600;
        background-color: rgba(0, 0, 0, 0.3);
    }

    .url-table td {
        padding: 14px 18px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        background-color: rgba(255, 255, 255, 0.02);
        vertical-align: top;
    }

    .url-table tr:nth-child(even) td {
        background-color: rgba(255, 255, 255, 0.04);
    }

    .url-table tr:hover td {
        background-color: rgba(255, 255, 255, 0.09);
        transition: background-color 0.3s;
    }

    .url-table a {
        color: #4db8ff;
        text-decoration: underline;
        word-break: break-word;
    }

  .wrap {
      word-break: break-word;
      white-space: normal;
      max-width: 300px;
  }

  .url-table td:last-child {
      text-align: center;
  }

  .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      margin: 0 4px;
      background-color: #4db8ff;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 90px;
  }

  .action-group-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px; /* khoảng cách giữa 2 nút */
  }

    .action-btn:hover {
        background-color: #3399cc;
    }

    .action-btn.delete {
        background-color: #ff4d4f;
    }

      .action-btn.delete:hover {
          background-color: #d9363e;
      }

  .no-url {
      text-align: center;
      color: #aaa;
      font-style: italic;
      margin-top: 20px;
  }
</style>

