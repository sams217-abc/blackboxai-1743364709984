import { auth, database, storage } from './firebase.js';

// DOM Elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const noMessages = document.getElementById('no-messages');

// Current user and couple group
let currentUser = null;
let coupleGroupId = null;

// Initialize messaging
const initMessaging = async () => {
  currentUser = auth.currentUser;
  
  // Get the couple group ID for current user
  const userRef = database.ref(`users/${currentUser.uid}`);
  const snapshot = await userRef.once('value');
  coupleGroupId = snapshot.val().coupleGroupId;

  if (coupleGroupId) {
    loadMessages();
    setupEventListeners();
  } else {
    // Redirect to couple pairing if no group exists
    window.location.href = 'pairing.html';
  }
};

// Load existing messages
const loadMessages = () => {
  const messagesRef = database.ref(`messages/${coupleGroupId}`);
  
  messagesRef.on('value', (snapshot) => {
    messagesContainer.innerHTML = '';
    const messages = snapshot.val();
    
    if (!messages || Object.keys(messages).length === 0) {
      noMessages.classList.remove('hidden');
      return;
    }
    
    noMessages.classList.add('hidden');
    
    Object.entries(messages).forEach(([id, message]) => {
      const messageElement = createMessageElement(message);
      messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
};

// Create message element
const createMessageElement = (message) => {
  const isCurrentUser = message.senderId === currentUser.uid;
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`;
  
  messageDiv.innerHTML = `
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-800'}">
      ${message.content ? `<p class="text-sm">${message.content}</p>` : ''}
      ${message.imageUrl ? `<img src="${message.imageUrl}" class="mt-2 rounded-lg max-w-full h-auto">` : ''}
      <p class="text-xs mt-1 ${isCurrentUser ? 'text-pink-200' : 'text-gray-500'}">${timestamp}</p>
    </div>
  `;
  
  return messageDiv;
};

// Send text message
const sendMessage = async () => {
  const content = messageInput.value.trim();
  if (!content) return;

  const message = {
    content,
    senderId: currentUser.uid,
    timestamp: Date.now()
  };

  try {
    await database.ref(`messages/${coupleGroupId}`).push(message);
    messageInput.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message');
  }
};

// Upload and send image
const sendImage = async (file) => {
  const storageRef = storage.ref(`images/${coupleGroupId}/${file.name}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed',
    null,
    (error) => {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    },
    async () => {
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
      
      const message = {
        imageUrl: downloadURL,
        senderId: currentUser.uid,
        timestamp: Date.now()
      };

      await database.ref(`messages/${coupleGroupId}`).push(message);
    }
  );
};

// Setup event listeners
const setupEventListeners = () => {
  // Send message on button click
  sendBtn.addEventListener('click', sendMessage);
  
  // Send message on Enter key
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Attach image
  attachBtn.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      sendImage(file);
    }
    fileInput.value = '';
  });
};

// Initialize when auth state changes
auth.onAuthStateChanged((user) => {
  if (user && window.location.pathname.endsWith('chat.html')) {
    initMessaging();
  }
});