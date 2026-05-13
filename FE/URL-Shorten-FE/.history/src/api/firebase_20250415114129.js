// src/js/firebase.js
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

const googleLogin = async (router) => {
  try {
    console.log("router:", router);  // Log router to verify it's passed correctly

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log('Google Login successful', user);

    await axios.post('http://localhost:5005/api/auth/login', {
      email: user.email,
    });
    // Save user info to Realtime Database
    const userRef = ref(db, 'users/' + user.uid);
    await set(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });

    // Save user info to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(user));

    // Redirect to home page after successful login
    if (router) {
      router.push('/');  // Ensure router is passed correctly
    } else {
      console.error('Router is undefined!');
    }

    return user;
  } catch (error) {
    console.error('Error during Google login: ', error.message);
    throw new Error(error.message);
  }
};

export { googleLogin };
