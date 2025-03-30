import { auth, database } from './firebase.js';

// DOM Elements
const createGroup = document.getElementById('create-group');
const joinGroup = document.getElementById('join-group');
const groupCreated = document.getElementById('group-created');
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const coupleCodeInput = document.getElementById('couple-code');
const groupCodeDisplay = document.getElementById('group-code');

// Current user
let currentUser = null;

// Generate random couple code
const generateCoupleCode = () => {
  const adjectives = ['Happy', 'Love', 'Sweet', 'Cute', 'Forever', 'Amour'];
  const nouns = ['Pair', 'Duo', 'Couple', 'Match', 'Bond', 'Unity'];
  const randomNum = Math.floor(100 + Math.random() * 900); // 100-999
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${randomNum}`;
};

// Create new couple group
const createCoupleGroup = async () => {
  const coupleCode = generateCoupleCode();
  
  try {
    // Create group in database
    const groupRef = database.ref('coupleGroups').push();
    await groupRef.set({
      code: coupleCode,
      members: [currentUser.uid],
      createdAt: Date.now()
    });
    
    // Save group ID to user profile
    await database.ref(`users/${currentUser.uid}`).update({
      coupleGroupId: groupRef.key
    });
    
    // Show success UI
    createGroup.classList.add('hidden');
    joinGroup.classList.add('hidden');
    groupCreated.classList.remove('hidden');
    groupCodeDisplay.textContent = coupleCode;
    
    // Listen for partner joining
    groupRef.on('value', (snapshot) => {
      const group = snapshot.val();
      if (group.members.length === 2) {
        window.location.href = 'chat.html';
      }
    });
    
  } catch (error) {
    console.error('Error creating group:', error);
    alert('Failed to create couple group');
  }
};

// Join existing couple group
const joinCoupleGroup = async () => {
  const coupleCode = coupleCodeInput.value.trim();
  if (!coupleCode) return;

  try {
    // Find group with matching code
    const groupsRef = database.ref('coupleGroups');
    const snapshot = await groupsRef.orderByChild('code').equalTo(coupleCode).once('value');
    
    if (!snapshot.exists()) {
      throw new Error('Invalid couple code');
    }
    
    // Get the first matching group (should be only one)
    let groupId, groupData;
    snapshot.forEach((child) => {
      groupId = child.key;
      groupData = child.val();
    });
    
    // Check if group already has 2 members
    if (groupData.members.length >= 2) {
      throw new Error('This couple group is already full');
    }
    
    // Add current user to group
    await groupsRef.child(groupId).update({
      members: [...groupData.members, currentUser.uid]
    });
    
    // Save group ID to user profile
    await database.ref(`users/${currentUser.uid}`).update({
      coupleGroupId: groupId
    });
    
    // Redirect to chat
    window.location.href = 'chat.html';
    
  } catch (error) {
    console.error('Error joining group:', error);
    alert(error.message);
  }
};

// Initialize pairing page
const initPairing = () => {
  currentUser = auth.currentUser;
  
  // Check if user already has a group
  database.ref(`users/${currentUser.uid}/coupleGroupId`).once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        window.location.href = 'chat.html';
      }
    });
  
  // Set up event listeners
  createBtn.addEventListener('click', createCoupleGroup);
  joinBtn.addEventListener('click', joinCoupleGroup);
};

// Initialize when auth state changes
auth.onAuthStateChanged((user) => {
  if (user && window.location.pathname.endsWith('pairing.html')) {
    initPairing();
  }
});