<!--policypage.vue-->

<template>
  <div class="policy-container">
    <h1>Privacy Policy</h1>
    <p>Welcome to BiteLink's Privacy Policy page.</p>

    <h2>1. Introduction</h2>
    <p>We value your privacy and are committed to protecting your personal data.</p>

    <h2>2. Data Collection</h2>
    <p>We may collect and store information you provide when using our services.</p>

    <h2>3. Usage of Data</h2>
    <p>Your data will only be used for enhancing our services and ensuring a seamless experience.</p>

    <h2>4. Contact</h2>
    <p>If you have any questions, contact us at <a href="mailto:support@bitelink.com" class="email-link">support@bitelink.com</a>.</p>
  </div>
</template>

<script setup>
  import NavBar from "../components/NavBar.vue";
</script>


<style scoped>

  /* Đảm bảo trang có thể kéo xuống và có chiều cao đầy đủ */
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden; /* Ngừng cuộn ngang */
  }

  /* Tạo layout flexbox cho trang */
  #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Đảm bảo trang chiếm toàn bộ chiều cao */
  }

  /* Nội dung chính (phần policy) */
  .policy-container {
    flex: 1; /* Giúp phần nội dung chính chiếm không gian còn lại */
    max-width: 900px;
    padding: 10px;
    backdrop-filter: blur(8px);
    border-radius: 12px;
    color: white;
    text-align: left;
    margin-top: -50px
  }

  /* Tiêu đề chính */
  h1 {
    font-size: 36px;
    font-weight: bold;
    color: #d6b5dc;
    margin-bottom: 10px;
    padding-bottom: 10px;
  }

  /* Tiêu đề phụ */
  h2 {
    font-size: 26px;
    color: #8e24aa;
    margin-top: 24px;
    border-left: 5px solid #8e24aa;
    padding-left: 12px;
  }

  /* Đoạn văn */
  p {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 12px;
    color: #f5f5f5;
  }

  /* Footer sẽ luôn ở dưới cùng của trang */
  .footer {
    text-align: center;
    padding: 20px;
    color: white;
    background: rgba(0, 0, 0, 0.3);
    width: 100%;
  }

  /* Link email */
  .email-link {
    color: #d6b5dc;
    text-decoration: none;
    font-weight: bold;
  }

    .email-link:hover {
      text-decoration: underline;
      color: #e1a3e1;
    }
</style>
