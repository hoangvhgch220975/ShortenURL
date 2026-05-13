<!--\src\views\LoginPage.vue-->
<template>
  <div class="login-page">
    <div class="grid-container">
      <!-- Left Column: Login Form -->
      <div class="login-form">
        <h1 class="title">Login to Your Account</h1>

        <!-- Social Media Login Buttons -->
        <div class="social-buttons">
          <button class="btn-facebook">Facebook</button>
          <button class="btn-twitter">Twitter</button>
          <!-- Use GoogleLoginButton component here -->
          <GoogleLoginButton />
        </div>

        <p class="login-or">Or login with your account</p>

        <!-- Login Form -->
        <input v-model="username" type="text" placeholder="Username" class="input-field" />
        <input v-model="password" type="password" placeholder="Password" class="input-field" />

        <!-- Remember me and Forgot password -->
        <div class="remember-wrapper">
          <input v-model="remember" type="checkbox" id="remember" class="checkbox" />
          <label for="remember" class="remember-label">Remember</label>
          <a href="#" class="forgot-password">Forgot Password?</a>
        </div>
        <!-- Submit Button -->
        <button @click="login" class="btn-continue">Continue</button>
      </div>

      <!-- Right Column: Video Intro -->
      <div class="video-intro">
        <label class="lbl-video">
          VIDEO INTRO
          <img aria-hidden="true" alt="video-icon" src="https://openui.fly.dev/openui/30.svg?text=📹" class="video-icon" />
        </label>
        <div class="video-wrapper">
          <video controls autoplay muted loop class="video">
            <source src="../assets/intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <Footer />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import Footer from '../components/FooterCompo.vue'; // Import Footer component
  import GoogleLoginButton from '../components/GoogleLoginButton.vue'; // Import GoogleLoginButton component

  const username = ref('');
  const password = ref('');
  const remember = ref(false);

  const login = () => {
    console.log('Login attempt:', { 
      username: username.value,
      password: password.value,
      remember: remember.value,
    });
    // Call permission request after login (example)
    requestGeolocationPermission();
  };

 

  const requestGeolocationPermission = () => {
    if ('permissions' in navigator && 'geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (permissionStatus) {
        console.log('Geolocation permission state:', permissionStatus.state);

        if (permissionStatus.state === 'prompt') {
          // If the user hasn't decided yet, prompt for location access
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('User location:', position.coords.latitude, position.coords.longitude);
            },
            (error) => {
              console.error('Error fetching geolocation:', error);
            }
          );
        } else if (permissionStatus.state === 'granted') {
          // Permission granted
          console.log('Geolocation permission granted!');
        } else if (permissionStatus.state === 'denied') {
          // Permission denied
          console.log('Geolocation permission denied.');
        }
      }).catch((error) => {
        console.error('Error during permission query:', error);
      });
    } else {
      console.log('Permissions API or Geolocation is not supported.');
    }
  };

  onMounted(() => {
    // You can also trigger permission requests when the component mounts if necessary
    requestGeolocationPermission();
  });
</script>




<style scoped>

 

  /* Main container */
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: rgba(255, 255, 255, 0); /* Transparent background */
    padding: 20px;
    flex-direction: column; /* Add flex-direction to allow footer at bottom */
  }

  /* Grid container for left and right columns */
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    max-width: 1200px;
    width: 100%;
    align-items: center;
    margin-top: -20%;
  }

  /* Left column - Login form */
  .login-form {
    background: rgba(255, 255, 255, 0.1); /* Transparent background */
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    backdrop-filter: blur(10px); /* Adds blur effect behind the form */
  }

  .title {
    font-size: 2rem;
    font-weight: bold;
    color: #e1bee7;
    margin-bottom: 20px;
  }

  .social-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    justify-content: center;
    width: 100%;
  }

  .btn-facebook, .btn-twitter, .btn-google {
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    max-width: 140px;
    transition: background-color 0.3s;
  }

  .btn-facebook {
    background-color: #3b5998;
  }

    .btn-facebook:hover {
      background-color: #2d4373;
    }

  .btn-twitter {
    background-color: #1da1f2;
  }

    .btn-twitter:hover {
      background-color: #0d95e8;
    }

  .btn-google {
    background-color: #db4437;
  }

    .btn-google:hover {
      background-color: #c1351d;
    }

  .login-or {
    color: #ffffff;
    margin-bottom: 1rem;
  }

  .input-field {
    width: 100%;
    padding: 14px;
    margin: 10px 0;
    font-size: 1rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    background-color: rgba(255, 255, 255, 0.2); /* Transparent background for input */
  }

  .remember-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 10px;
  }

  .checkbox {
    margin-left: 0.5rem;
  }

  .remember-label {
    color: #ffffff;
  }

  .forgot-password {
    color: #ffffff;
    text-decoration: none;
    margin-left: 52%;
  }

    .forgot-password:hover {
      text-decoration: underline;
    }

  .btn-continue {
    background-color: #9c27b0;
    color: white;
    padding: 12px 20px;
    font-size: 1.1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    margin-top: 20px;
    transition: background-color 0.3s;
  }

    .btn-continue:hover {
      background-color: #7a1fd1;
    }

  /* Right column - Video intro */
  .video-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .lbl-video {
    background-color: #6a0dad;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .video-icon {
    margin-left: 10px;
  }

  .video-wrapper {
    width: 100%;
    max-width: 600px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .video {
    width: 100%;
    max-width: 100%;
    border-radius: 8px;
  }

  /* Footer Styling */
  .footer {
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7); /* Transparent background */
    color: #fff;
    padding: 20px 0;
    text-align: center;
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .footer-links {
    margin-top: 10px;
  }

  .footer-link {
    color: #fff;
    margin: 0 10px;
    text-decoration: none;
  }

    .footer-link:hover {
      text-decoration: underline;
    }
</style>
