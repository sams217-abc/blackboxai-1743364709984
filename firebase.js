// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkEXAMPLEKEY123",
  authDomain: "couple-chat-app.firebaseapp.com",
  databaseURL: "https://couple-chat-app-default-rtdb.firebaseio.com",
  projectId: "couple-chat-app",
  storageBucket: "couple-chat-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123def456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const messaging = firebase.messaging();

export { auth, database, storage, messaging };