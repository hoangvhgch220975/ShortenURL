import axios from 'axios';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebaseConfig';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// API Gateway URL
const API_GATEWAY_URL = 'http://localhost:5006';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

const googleLogin = async (router) => {
  try {
    // 1. Firebase Sign‑in
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Google Login successful', user);

    // 2. (Optionally) save Firebase ID Token 
    const firebaseToken = await user.getIdToken();
    localStorage.setItem('firebase_token', firebaseToken);

    // 3. Call backend to get JWT token
    const response = await axios.post(
      `${API_GATEWAY_URL}/api/auth/login`,
      {
        uid: user.uid,
        email: user.email
      }
    );
    console.log('Backend login response:', response.data);

    if (response.data.status === 'success') {
      // Lấy đúng trường accessToken từ payload
      // Get 
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem('jwt_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      console.log('JWT token saved:', accessToken);
    } else {
      console.error('Backend authentication failed:', response.data);
      throw new Error('Backend authentication failed');
    }

    // 4. Ghi thêm thông tin user vào Realtime Database
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    });

    // 5. Lưu status và user profile
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    }));

    // 6. Chuyển hướng
    if (router) {
      router.push('/');
    }
    return user;

  } catch (error) {
    console.error('Error during Google login:', error);
    throw error;
  }
};

export { googleLogin };
