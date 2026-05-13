<template>
  <div class="custom-url-form">
    <h3 class="title">Custom URL</h3>
    <input v-model="customUrl"
           type="text"
           placeholder="Enter custom URL name"
           class="input" />

    <div class="button-group">
      <button @click="submitCustomUrl" class="btn submit">Submit</button>
      <button @click="closeCustomForm" class="btn close">Close</button>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const customUrl = ref('');
  const emit = defineEmits();

  const submitCustomUrl = () => {
    if (customUrl.value.trim()) {
      emit('submit', customUrl.value);
    }
  };

  const closeCustomForm = () => {
    emit('close');
  };
</script>

<style scoped>
  .custom-url-form {
    padding: 24px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
    max-width: 420px;
    margin: 0 auto;
  }

  .title {
    font-size: 22px;
    font-weight: 600;
    color: white;
    margin-bottom: 18px;
    text-align: center;
  }

  .input {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    margin-bottom: 20px;
    outline: none;
    transition: border-color 0.3s, background 0.3s;
  }

    .input:focus {
      border-color: #ffffff;
      background: rgba(255, 255, 255, 0.2);
    }

  .button-group {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .btn {
    flex: 1;
    padding: 12px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    color: white;
    border: none;
    cursor: pointer;
    transition: background 0.3s;
  }

  .submit {
    background: linear-gradient(135deg, #8e24aa, #6a1b9a);
  }

    .submit:hover {
      background: linear-gradient(135deg, #7b1fa2, #4a148c);
    }

  .close {
    background: linear-gradient(135deg, #e53935, #c62828);
  }

    .close:hover {
      background: linear-gradient(135deg, #d32f2f, #b71c1c);
    }
</style>
