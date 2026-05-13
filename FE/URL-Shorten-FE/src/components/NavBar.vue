<!--src/components/navbar.vue-->


<template>
  <div :class="themeClass" class="navbar">
    <nav>
      <router-link to="/" class="logo-title">
        <img src="../assets/logo.png" alt="logo" />
        <span class="title">BiteLink</span>
      </router-link>
      <ul class="nav-links">
        <li><router-link to="/policy">POLICY</router-link></li>
        <li><router-link to="/url-management" @click="checkLogin">URL MANAGEMENT</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/login">LOGIN</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/register">REGISTER</router-link></li>
        <li v-if="isLoggedIn">
          <img :src="user.photoURL" alt="Avatar" class="user-avatar" />
        </li>
        <li v-if="isLoggedIn" @click="handleLogout">
          <router-link to="/">LOGOUT</router-link>
        </li>
        <li class="divider">|</li>
        <li @click="toggleTheme" class="theme-toggle">⚙️</li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { ref, onMounted, computed } from 'vue';
  import UrlService from '../api/UrlService';

  const router = useRouter();

  // Use computed for isLoggedIn to ensure reactivity
  const isLoggedIn = computed(() => {
    const loginStatus = localStorage.getItem('isLoggedIn');
    return loginStatus === 'true';
  });

  const user = ref({});
  const themeClass = ref('light-theme');
  const isAlertShown = ref(false);

  const checkLogin = (event) => {
    if (!isLoggedIn.value) {
      event.preventDefault();
      alert('Please log in to access URL Management!');
      router.push('/');
    }
  };

  const toggleTheme = () => {
    themeClass.value = themeClass.value === 'light-theme' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', themeClass.value);
    document.body.className = themeClass.value;
  };

  const handleLogout = async () => {
    try {
      // Attempt to logout via API
      await UrlService.logout();

      // Update logout state
      localStorage.setItem('isLoggedIn', 'false');
      user.value = {};

      alert('Logged out successfully!');
      router.push('/');

      // Optional: force page reload to clear all state
      window.location.reload();
    } catch (error) {
      console.error('Logout Error:', error);

      // Fallback logout
      localStorage.setItem('isLoggedIn', 'false');
      user.value = {};

      alert('Logged out of the application');
      router.push('/');

      // Optional: force page reload
      window.location.reload();
    }
  };

  const handleTokenInvalidity = async () => {
    // Chỉ hiển thị alert một lần
    if (!isAlertShown.value) {
      isAlertShown.value = true;

      // Xóa thông tin đăng nhập
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('jwt_token');

      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      router.push('/');

      // Đặt lại cờ alert sau một khoảng thời gian
      setTimeout(() => {
        isAlertShown.value = false;
      }, 5000); // 5 giây
    }
  };

  onMounted(async () => {
    console.log('Is Logged In:', isLoggedIn.value); // Debug log

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.photoURL) {
      user.value = storedUser;
    }
    // Check token validity only if logged in
    if (isLoggedIn.value) {
      try {
        console.log('Checking token validity...'); // Debug log
        const isTokenValid = await UrlService.checkTokenValidity();
        console.log('Token Validity Result:', isTokenValid); // Debug log

        if (!isTokenValid) {
          console.log('Token is invalid, logging out...'); // Debug log
          // Handle token invalidity
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          localStorage.removeItem('jwt_token');

          alert('Your session has expired. Please log in again.');
          router.push('/');
        }
      } catch (error) {
        console.error('Token validity check failed:', error);

        // Fallback logout
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('jwt_token');

        alert('An error occurred. Please log in again.');
        router.push('/');
      }
    }
  });
</script>

<!-- Existing styles remain the same -->
<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;800&display=swap');

  /* Thanh Navbar */
  .navbar {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.1); /* Transparent */
    backdrop-filter: blur(10px); /* Blurring effect */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease;
  }

  /* Light theme */
  .light-theme .navbar {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Dark theme */
  .dark-theme .navbar {
    background: rgba(0, 0, 0, 0.8);
  }

  /* Navbar main structure */
  nav {
    display: flex;
    justify-content: space-between; /* Push logo to the left, menu to the right */
    align-items: center;
    max-width: 99%;
    margin: 0 auto;
  }

  /* Logo + Title */
  .logo-title {
    display: flex;
    align-items: center;
    gap: 8px; /* Space between logo and title */
  }

    /* Logo */
    .logo-title img {
      height: 48px;
      width: 48px;
      object-fit: contain;
      padding: 4px;
    }

  /* Title */
  .title {
    font-size: 24px;
    font-weight: 600;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.5px;
    color: white;
    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.5); /* Stroke black */
    text-align: center;
  }

  /* Nav links */
  .nav-links {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 30px;
    margin: 0;
    padding: 0;
  }

    .nav-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
    }

      .nav-links a:hover {
        opacity: 0.8;
        color: rebeccapurple;
      }

  /* Divider */
  .divider {
    color: white;
  }

  /* Theme toggle button */
  .theme-toggle {
    cursor: pointer;
    color: white;
    font-size: 24px;
    transition: color 0.3s ease;
  }

    .theme-toggle:hover {
      color: rebeccapurple;
    }

  /* User avatar styles */
  .user-avatar {
    width: 40px; /* Set the width of the avatar */
    height: 40px; /* Set the height of the avatar */
    object-fit: cover; /* Ensure the image covers the area without stretching */
    border-radius: 50%; /* Make the image round */
    border: 2px solid #fff; /* Optional: add a white border around the avatar */
  }
</style>
