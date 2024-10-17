// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2v40RvMN4H6yxIUPUSVi05V2-WhT2Khs",
  authDomain: "login-form-28b9b.firebaseapp.com",
  projectId: "login-form-28b9b",
  storageBucket: "login-form-28b9b.appspot.com",
  messagingSenderId: "469800604412",
  appId: "1:469800604412:web:eff5401e763dd165627d79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Function to show a message on the page (success/error)
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Registration logic
if (document.getElementById('signup-form')) {
  const signUpForm = document.getElementById('signup-form');

  signUpForm.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent the default form submission behavior

    const username = document.getElementById('username').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Store the user's details in Firestore
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, {
          username: username,
          email: email,
          uid: user.uid
        }).then(() => {
          // Show success message and redirect to the login page
          showMessage('Account created successfully! Redirecting to login...', 'signUpMessage');
          setTimeout(() => {
            window.location.href = 'login.html';  // Redirect to the login page after registration
          }, 1000);
        }).catch((error) => {
          console.error('Error saving user data:', error);
          showMessage('Error saving user data. Please try again.', 'signUpMessage');
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
          showMessage('Email is already in use. Please try logging in.', 'signUpMessage');
        } else {
          showMessage('Error signing up. Please try again.', 'signUpMessage');
        }
      });
  });
}

// Login logic
if (document.getElementById('login-form')) {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent the default form submission behavior

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Fetch the user's details from Firestore using their UID
        const docRef = doc(db, "users", user.uid);
        getDoc(docRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              localStorage.setItem('loggedInUser', JSON.stringify(userData));
              window.location.href = 'index.html';  // Redirect to the homepage
            } else {
              showMessage('User data not found. Redirecting...', 'signInMessage');
              setTimeout(() => window.location.href = 'index.html', 1000);  // Fallback in case of missing user data
            }
          })
          .catch((error) => {
            console.error('Error fetching user data from Firestore:', error);
            showMessage('Error fetching user data. Redirecting...', 'signInMessage');
            setTimeout(() => window.location.href = 'index.html', 1000);  // Fallback
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
          showMessage('Incorrect Email or Password', 'signInMessage');
        } else {
          showMessage('Account does not exist. Please sign up.', 'signInMessage');
        }
      });
  });
}

// Handle Contact Form Submission and create booking info
document.addEventListener('formSubmitted', async function (e) {
  const formData = e.detail;
  const user = JSON.parse(localStorage.getItem('loggedInUser'));  // Ensure user is logged in

  if (!user) {
    alert("Please log in to submit the form.");
    return;
  }

  try {
    // Store the form data in Firestore
    const docRef = doc(db, "contactForm", user.uid);
    await setDoc(docRef, {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      make: formData.make,
      year: formData.year,
      services: formData.services,
      date: formData.date,
      additionalInfo: formData.additionalInfo,
      userId: user.uid,
      timestamp: new Date().toISOString()
    });

    // Add booking information to Firestore for notifications
    const bookingRef = collection(db, "bookingInformation");
    await addDoc(bookingRef, {
      userId: user.uid,
      message: `Appointment booked for ${formData.name || '(No Name)'} (${formData.make || '(No Make)'} - ${formData.year || '(No Year)'}) on ${formData.date}. Services: ${formData.services.join(', ')}`,
      timestamp: new Date().toISOString()
    });

    // Alert success after both operations succeed
    alert("Form data stored in Firestore successfully!");

    // After storing the booking, retrieve and update the notification dropdown
    loadNotifications();
  } catch (error) {
    console.error("Error submitting form: ", error);
    alert("Error submitting the form. Please try again.");
  }
});

// Load notifications from Firestore when the page loads
async function loadNotifications() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const notificationDropdown = document.getElementById('notification-dropdown');

  if (user) {
    try {
      // Query Firestore for booking information related to the logged-in user
      const q = query(collection(db, "bookingInformation"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push(doc.data());
      });

      // If bookings are found, display them
      if (bookings.length > 0) {
        displayNotifications(bookings);
        // Save booking info in localStorage to persist across page changes (optional)
        localStorage.setItem('bookings', JSON.stringify(bookings));
      } else {
        // If no bookings are found, clear localStorage and update UI
        localStorage.removeItem('bookings');
        notificationDropdown.innerHTML = '<p>No upcoming appointments.</p>';
      }
    } catch (error) {
      console.error("Error fetching booking information: ", error);
      localStorage.removeItem('bookings');  // Clear stale data if there was an error
      notificationDropdown.innerHTML = '<p>Error loading notifications.</p>';
    }
  }
}

// Display notifications in the dropdown
function displayNotifications(bookings) {
  const notificationDropdown = document.getElementById('notification-dropdown');
  notificationDropdown.innerHTML = ''; // Clear existing notifications

  bookings.forEach((booking) => {
    const bookingHTML = `
      <div class="notification-item">
        <p>${booking.message}</p>
      </div>
    `;
    notificationDropdown.innerHTML += bookingHTML;
  });
}

// Check for booking information on page load
document.addEventListener('DOMContentLoaded', function () {
  const storedBookings = JSON.parse(localStorage.getItem('bookings'));
  const notificationDropdown = document.getElementById('notification-dropdown');

  // Clear any stale notifications
  notificationDropdown.innerHTML = '';

  // Check if bookings exist in localStorage
  if (storedBookings && storedBookings.length > 0) {
    displayNotifications(storedBookings);
  } else {
    loadNotifications();  // Load bookings from Firestore if not in localStorage
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const reactionButtons = document.querySelectorAll('.reaction-button');
  const reactionMessage = document.getElementById('reaction-message');
  const reviewTextarea = document.getElementById('review');
  let selectedReaction = '';

  // Handle reaction button clicks
  reactionButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedReaction = button.getAttribute('data-reaction');

      switch (selectedReaction) {
        case 'excited':
          reactionMessage.textContent = 'We are thrilled that you are excited! 😃';
          break;
        case 'happy':
          reactionMessage.textContent = 'We are glad you are happy! 😊';
          break;
        case 'neutral':
          reactionMessage.textContent = 'Thank you for your feedback. 😐';
          break;
        case 'sad':
          reactionMessage.textContent = 'We are sorry you are sad. 😞 We will try to improve!';
          break;
        case 'angry':
          reactionMessage.textContent = 'We apologize if something went wrong. 😡 Please let us know how we can improve!';
          break;
      }

      reactionMessage.style.opacity = '1';
    });
  });

  // Handle feedback submission
  document.querySelector('.submit-review').addEventListener('click', async () => {
    const reviewText = reviewTextarea.value.trim();

    // Ensure a reaction is selected and feedback is provided
    if (!selectedReaction) {
      alert('Please select a reaction before submitting your feedback.');
      return;  // Stop execution if no reaction is selected
    }

    if (!reviewText) {
      alert('Please provide some feedback before submitting.');
      return;  // Stop execution if feedback text is missing
    }

    // Proceed with storing the feedback in Firestore
    try {
      await addDoc(collection(db, 'reactions'), {
        reaction: selectedReaction,
        review: reviewText,
        timestamp: new Date().toISOString(),
      });

      alert('Thank you for your feedback!');

      // Clear the feedback form after submission
      reactionMessage.textContent = '';
      reviewTextarea.value = '';
      selectedReaction = '';

    } catch (error) {
      console.error('Error submitting feedback: ', error);
      alert('Error submitting feedback. Please try again.');
    }
  });
});
