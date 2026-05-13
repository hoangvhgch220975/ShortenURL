<template>
  <div class="popup-overlay">
    <div class="popup-container">
      <h3 class="title">🎉 Your Shortened Link</h3>

      <input :value="shortenedLink" type="text" readonly class="link-input" />

      <div class="button-group">
        <button @click="copyLink" class="btn copy">Copy</button>
        <button @click="showQR = true" class="btn qr">See QR Code</button>
      </div>

      <div v-if="showQR" class="qr-preview">
        <qrcode-vue :value="shortenedLink" :size="180" />
      </div>
    </div>
  </div>
</template>

<script>
  import QrcodeVue from 'qrcode.vue';

  export default {
    components: {
      QrcodeVue,
    },
    props: ['shortenedLink'],
    data() {
      return {
        showQR: false
      };
    },
    mounted() {
      this.checkIfQRExists();
    },
    methods: {
      async copyLink() {
        await navigator.clipboard.writeText(this.shortenedLink);
        alert('Link copied to clipboard!');
        this.$emit('close');
      },

      extractShortId(url) {
        return url.split('/').pop();
      },

      async handleQRCode() {
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
            console.log('✅ QR code cached in Redis');
          } catch (error) {
            console.error('❌ Error caching QR code:', error);
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
            console.warn('⚠️ QR not found in Redis. Auto-creating QR...');
            this.showQR = true;
            await this.handleQRCode();
            this.showQR = false; // ẩn QR ngay sau khi tạo
            return;
          }

          if (!res.ok) {
            console.warn('❌ QR request failed:', res.status);
            return;
          }

          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await res.text();
            console.warn('⚠️ Unexpected response (not JSON):', text.slice(0, 100));
            return;
          }

          const data = await res.json();
          if (data.qrBase64) {
            console.log('✅ QR exists in Redis');
          }
        } catch (err) {
          console.warn('❌ Error checking Redis for QR:', err);
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
      background: rgba(30, 30, 30, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
  }

  .popup-container {
      background: linear-gradient(145deg, #2b2b2b, #1f1f1f);
      color: white;
      padding: 32px 48px;
      border-radius: 18px;
      width: 500px;
      max-width: 90%;
      text-align: center;
      box-shadow: 0 18px 38px rgba(0, 0, 0, 0.6);
  }

  .title {
      font-size: 26px;
      color: #d0bfff;
      margin-bottom: 24px;
  }

  .link-input {
      width: 100%;
      padding: 14px 18px;
      font-size: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      margin-bottom: 24px;
      transition: 0.3s;
  }

    .link-input:focus {
        border-color: #ffffff;
        outline: none;
    }

  .button-group {
      display: flex;
      justify-content: space-between;
      gap: 16px;
  }

  .btn {
      flex: 1;
      padding: 14px 0;
      font-size: 16px;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
  }

  .copy {
      background: linear-gradient(135deg, #9b5de5, #5f27cd);
      color: #fff;
  }

    .copy:hover {
        background: linear-gradient(135deg, #7c3aed, #4b1eaa);
    }

  .qr {
      background: linear-gradient(135deg, #ff8c42, #e67e22);
      color: #fff;
  }

    .qr:hover {
        background: linear-gradient(135deg, #e67300, #cc6e1d);
    }

  .qr-preview {
      margin-top: 24px;
      display: flex;
      justify-content: center;
      animation: fadeIn 0.4s ease-in-out;
  }

  @keyframes fadeIn {
      from {
          opacity: 0;
          transform: translateY(10px);

    }

      to {
          opacity: 1;
          transform: translateY(0);

    }
  }
</style>
