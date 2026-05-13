import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import PolicyPage from '../views/PolicyPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import UrlManagementPage from '../views/User/ManageURL.vue'; 

//src/router/index.js

// Define routes
const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/policy', name: 'Policy', component: PolicyPage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  {
    path: '/url-management',
    name: 'UrlManagement',
    component: UrlManagementPage,
    meta: { requiresAuth: true }, // This route requires authentication
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard: Check if route requires authentication
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn'); // Adjust this based on your authentication logic

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');  // Redirect to login if the user is not logged in
  } else {
    next();  // Proceed to the route if no authentication is required
  }
});

export default router;
