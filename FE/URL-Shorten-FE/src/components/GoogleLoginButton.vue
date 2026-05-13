<!--src/componenys/GooglrLoginButton.vue-->

<template>
  <button @click="loginWithGoogle" class="google-login-btn">Google</button>
</template>

<script>
  import { googleLogin } from '../api/firebase';  // Ensure correct import path
  import { useRouter } from 'vue-router';

  export default {
    setup() {
      const router = useRouter();  // Access the router here

      const loginWithGoogle = async () => {
        try {
          // Ensure the router is passed correctly to googleLogin
          const user = await googleLogin(router);
          console.log('User info: ', user);
          // Handle successful login (update the state or redirect here)
        } catch (error) {
          console.error('Error during Google login: ', error.message);
        }
      };

      return { loginWithGoogle };
    }
  };
</script>

<style scoped>
  .google-login-btn {
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    max-width: 140px;
    background-color: #db4437; /* Google red color */
  }

    .google-login-btn:hover {
      background-color: #c1351d; /* Darker shade on hover */
    }
</style>
