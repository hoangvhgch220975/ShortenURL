<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-container">
      <h3 class="title">🔍 QR Code</h3>

      <p class="link-preview">{{ shortenedLink }}</p>

      <div v-if="showQR" class="qr-preview">
        <qrcode-vue :value="shortenedLink" :size="180" />
      </div>
      <p v-else class="loading">Loading QR code...</p>

      <button class="btn close-btn" @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue';

export default {
  name: 'QrPopup',
  components: { QrcodeVue },
  props: ['shortenedLink'],
  data() {
    return {
      showQR: false,
    };
  },
  mounted() {
    this.checkIfQRExists();
  },
  methods: {
    extractShortId(url) {
      return url.split('/').pop();
    },

    async handleQRCode() {
      this.showQR = true;
      this.$nextTick(async () => {
        const canvas = this.$el.querySelector('canvas');
        if (!canvas) return;

        const qrBase64 = canvas.toDataURL('image/png');
        const shortId = this.extractShortId(this.shortenedLink);
        const token = localStorage.getItem('jwt_token');

        try {
          await fetch(`http://localhost:5006/api/url/${shortId}/qr`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ base64Qr: qrBase64 })
          });
        } catch (error) {
          console.error('❌ Failed to cache QR:', error);
        }
      });
    },

    async checkIfQRExists() {
      const shortId = this.extractShortId(this.shortenedLink);
      const token = localStorage.getItem('jwt_token');

      try {
        const res = await fetch(`http://localhost:5006/api/url/${shortId}/qr`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 404) {
          await this.handleQRCode();
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        if (data.qrBase64) {
          this.showQR = true;
        }
      } catch (err) {
        console.error('Error checking QR:', err);
      }
    }
  }
};
</script>

<style scoped>
  .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(20, 20, 20, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  }

  .popup-container {
      background: #222;
      color: white;
      padding: 30px 40px;
      border-radius: 16px;
      width: 380px;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
  }

  .title {
      font-size: 22px;
      margin-bottom: 16px;
      color: #d0bfff;
  }

  .link-preview {
      font-size: 14px;
      margin-bottom: 12px;
      color: #aaa;
      word-break: break-all;
  }

  .qr-preview {
      margin: 16px auto;
  }

  .loading {
      color: #bbb;
      margin: 20px;
  }

  .btn.close-btn {
      margin-top: 16px;
      padding: 10px 20px;
      background: #444;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      transition: 0.3s;
  }

    .btn.close-btn:hover {
        background: #666;
    }
</style>
