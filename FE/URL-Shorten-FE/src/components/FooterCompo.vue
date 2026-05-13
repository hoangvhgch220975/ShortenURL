<template>
  <footer :class="$style.footer">
    <div :class="$style.contentWrapper">
      <div :class="$style.aboutSection">
        <p :class="$style.aboutBitelink"><b>About BiteLink</b></p>
        <p :class="$style.aboutBitelink">Tired of long, clunky URLs? BiteLink is here to help! 🚀</p>
        <p :class="$style.aboutBitelink">
          With our fast and reliable URL shortener, you can turn any long link into a sleek, shareable version in seconds.
        </p>
      </div>

      <!-- Social Media and Language Selector Section -->
      <div :class="$style.socmedLangWrapper">
        <div :class="$style.socmed">
          <a :href="'https://github.com/your-username'" target="_blank">
            <i :class="'mdi mdi-github ' + $style.socmedIcon"></i>
          </a>
          <a :href="'https://www.linkedin.com/in/your-profile'" target="_blank">
            <i :class="'mdi mdi-linkedin ' + $style.socmedIcon"></i>
          </a>
          <a :href="'https://twitter.com/your-profile'" target="_blank">
            <i :class="'mdi mdi-twitter ' + $style.socmedIcon"></i>
          </a>
          <a :href="'https://www.instagram.com/your-profile'" target="_blank">
            <i :class="'mdi mdi-instagram ' + $style.socmedIcon"></i>
          </a>
        </div>

        <!-- Language Selector -->
        <div :class="$style.langSelect">
          <div :class="$style.languageSelector">
            <i :class="'mdi mdi-menu-down ' + $style.chevronDownIcon"></i>
            <i :class="'mdi mdi-earth ' + $style.androidGlobeIcon"></i>
            <div :class="$style.group">
              <div :class="$style.languageText" @click="toggleLanguage">
                {{ currentLanguage === 'en' ? 'English - En' : 'Tiếng Việt - Vn' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer :class="$style.footerBottom">
      <p>© 2025 BiteLink. All rights reserved.</p>
    </footer>
  </footer>
</template>

<script setup>
  import { ref } from 'vue'

  const currentLanguage = ref('en')

  const toggleLanguage = () => {
    currentLanguage.value = currentLanguage.value === 'en' ? 'vi' : 'en'
  }
</script>

<style scoped module>
  /* Footer Styling */
  .footer {
    position: relative;
    bottom: 0;
    left: -10%;
    width: 100%;
    padding: 10px 20px;
    text-align: left;
    color: #fff;
    z-index: 0;
  }

  /* Flexbox Layout Adjustments */
  .contentWrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start; /* Align top */
    flex-wrap: wrap;
    color: rgba(255, 255, 255, 0.6); /* Trong suốt */
  }

  /* Wrapper for Social Media and Language Selector */
  .socmedLangWrapper {
    display: flex;
    flex-direction: column; /* Stack items vertically */
    align-items: flex-start; /* Align to the left */
    color: rgba(255, 255, 255, 0.6); /* Trong suốt */
  }

  .socmed {
    display: flex;
    gap: 15px; /* Reduce gap between icons */
    flex-wrap: wrap; /* Allows wrapping of icons */
  }

  .langSelect {
    margin-top: 15px; /* Adds space between the social media icons and language selector */
    margin-left: 10px; /* Lệch trái thêm 10px */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    border: 1px solid #fff; /* Viền trắng */
    padding: 10px; /* Padding bên trong */
    margin-right: 50px;
    border-radius: 5px; /* Bo góc */
  }

  .socmedIcon {
    font-size: 18px;
    color: #fff;
    transition: color 0.3s;
    margin-left: 10px;
  }

    .socmedIcon:hover {
      color: #9c27b0;
    }

  .languageSelector {
    display: flex;
    align-items: center;
  }

  .chevronDownIcon, .androidGlobeIcon {
    font-size: 18px;
    color: #fff;
    margin: 0 8px;
    transition: transform 0.3s, color 0.3s;
  }

    .chevronDownIcon:hover, .androidGlobeIcon:hover {
      transform: scale(1.2);
      color: #9c27b0;
    }

  .languageText {
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    color: #fff;
    transition: color 0.3s;
  }

    .languageText:hover {
      color: #9c27b0;
    }

  .footerBottom {
    text-align: left;
    padding: 8px 0;
    color: #fff;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6); /* Trong suốt */
  }
</style>
