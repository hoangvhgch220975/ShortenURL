<template>
  <div class="register-container">
    <div class="form-container">
      <h2>Join us now!</h2>
      <form @submit.prevent="submitForm">
        <div class="input-field">
          <input v-model="name" type="text" placeholder="Name" required />
        </div>
        <div class="input-field">
          <input v-model="password" type="password" placeholder="Password" required />
        </div>
        <div class="input-field">
          <input v-model="confirmPassword" type="password" placeholder="Confirm password" required />
        </div>
        <button type="submit" class="continue-btn">CONTINUE</button>
      </form>
    </div>
    <Footer />
  </div>
</template>

<script>
  import Footer from '../components/FooterCompo.vue'; // Import Footer component

  export default {
    data() {
      return {
        name: "",
        password: "",
        confirmPassword: "",
      };
    },
    methods: {
      submitForm() {
        if (this.password === this.confirmPassword) {
          // Handle registration logic
          console.log("Form submitted");
        } else {
          alert("Passwords do not match!");
        }
      },
    },
  };
</script>

<style scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
  }

  .form-container {
    background-color: #333;
    padding: 40px;
    border-radius: 12px;
    width: 400px;
    background: rgba(255, 255, 255, 0.1);
    text-align: center;
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.3);
    margin-top: -130px;
    transition: transform 0.3s ease-in-out;
  }



  h2 {
    color: #E1BEE7;
    font-size: 26px;
    margin-bottom: 20px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .input-field {
    margin-bottom: 20px;
    padding-right: 35px;
    border: 1px solid var(--border);
    border-radius: 0.375rem
  }

    .input-field input {
      width: 100%;
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 6px;
      border: 1px solid #444;
      background-color: rgba(255, 255, 255, 1);
      color: #000; /* Ensure text is black by default */
      font-size: 16px;
      outline: none;
      transition: all 0.3s ease;
    }

      .input-field input:focus {
        border-color: #9e4eff;
        background-color: white; /* White background on focus */
        color: #000; /* Ensure text remains black */
        box-shadow: 0px 0px 10px rgba(158, 78, 255, 0.5); /* Light purple glow */
      }


  button.continue-btn {
    width: 100%;
    padding: 12px;
    background-color: #9C27B0;
    color: white;
    font-size: 18px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }

    button.continue-btn:hover {
      background-color: #7a3ce0;
      transform: translateY(-2px);
    }

    button.continue-btn:active {
      background-color: #6826b8;
      transform: translateY(2px);
    }
</style>
