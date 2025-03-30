import { auth, database, storage } from './firebase.js';

// DOM Elements
const profilePic = document.getElementById('profile-pic');
const displayName = document.getElementById('display-name');
const userEmail = document.getElementById('user-email');
const nameInput = document.getElementById('name-input');
const bioInput = document.getElementById('bio-input');
const saveBtn = document.getElementById('save-btn');
const backBtn = document.getElementById('back-btn');
const profileUpload = document.getElementById('profile-upload');

// Current user
let currentUser = null;

// Load profile data
const loadProfile = async () => {
  currentUser = auth.currentUser;
  
  // Set basic user info
  userEmail.textContent = currentUser.email;
  displayName.textContent = currentUser.displayName || 'Your Name';
  nameInput.value = currentUser.displayName || '';

  // Load profile data from database
  const profileRef = database.ref(`profiles/${currentUser.uid}`);
  const snapshot = await profileRef.once('value');
  
  if (snapshot.exists()) {
    const profileData = snapshot.val();
    if (profileData.bio) bioInput.value = profileData.bio;
    if (profileData.photoURL) profilePic.src = profileData.photoURL;
  }
};

// Save profile changes
const saveProfile = async () => {
  const name = nameInput.value.trim();
  const bio = bioInput.value.trim();

  try {
    // Update display name in auth
    if (name && name !== currentUser.displayName) {
      await currentUser.updateProfile({ displayName: name });
      displayName.textContent = name;
    }

    // Save profile data to database
    const updates = {};
    if (bio) updates.bio = bio;
    
    await database.ref(`profiles/${currentUser.uid}`).update(updates);

    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to update profile');
  }
};

// Upload profile picture
const uploadProfilePic = async (file) => {
  const storageRef = storage.ref(`profile_pictures/${currentUser.uid}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed',
    null,
    (error) => {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture');
    },
    async () => {
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      
      // Update user profile with new photo URL
      await currentUser.updateProfile({ photoURL: downloadURL });
      await database.ref(`profiles/${currentUser.uid}`).update({ photoURL: downloadURL });
      
      // Update displayed image
      profilePic.src = downloadURL;
    }
  );
};

// Setup event listeners
const setupEventListeners = () => {
  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  saveBtn.addEventListener('click', saveProfile);

  profileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfilePic(file);
    }
  });
};

// Initialize profile page
const initProfile = () => {
  currentUser = auth.currentUser;
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  loadProfile();
  setupEventListeners();
};

// Initialize when auth state changes
auth.onAuthStateChanged((user) => {
  if (user && window.location.pathname.endsWith('profile.html')) {
    initProfile();
  }
});