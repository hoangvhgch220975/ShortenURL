<!--HomePAge.vue-->

<template>
  <div class="home-container">
    <NavBar />
    <div class="content">
      <h1 class="title">Say hello to Us</h1>
      <p class="subtitle">URL shortener tool provided by BiteLink</p>
      <ShortenForm />
      <p class="terms">
        By clicking SHORTEN, you accept
        <router-link to="/policy" class="terms-link">Terms of Using</router-link>
      </p>
    </div>
    <FooterCompo />

  </div>
</template>

<script setup>
  import NavBar from "../components/NavBar.vue";
  import ShortenForm from "../components/ShortenForm.vue";
  import FooterCompo from "../components/FooterCompo.vue";
</script>


<style scoped>

  /* Nội dung chính */
  .content {
    width: 100%;
    max-width: 1000px; /* Tăng chiều rộng tối đa */
    text-align: center;
    padding: 20px;
    margin-top: -80px;
  }

  /* Tiêu đề */
  .title {
    font-size: 48px;
    font-weight: bold;
    color: #D6B5DC; /* Màu tím */
    margin-bottom: 1rem; /* Khoảng cách với dòng mô tả */
  }

  /* Mô tả */
  .subtitle {
    font-size: 24px;
    font-weight: 500;
    color: white;
    margin-bottom: 2rem; /* Đẩy xuống xa hơn */
  }

  /* Điều khoản */
  .terms {
    font-size: 14px;
    color: white;
    margin-top: 2rem;
  }

  /* Link điều khoản */
  .terms-link {
    color: #8e24aa;
    text-decoration: none;
  }

    .terms-link:hover {
      text-decoration: underline;
      box-shadow: 0 6px 20px rgba(138, 43, 226, 0.6);
      color: #6a0dad;
    }
</style>
