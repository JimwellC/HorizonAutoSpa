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

// Show message function
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Check if we are on the registration page
if (document.getElementById('submitSignUp')) {
  const signUp = document.getElementById('signup-form');

  // Handle sign-up form submission
  signUp.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent the default form submission

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
          // Show success message and redirect to login page
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


// Check if we are on the login page
if (document.getElementById('login-form')) {
  const loginForm = document.getElementById('login-form');
  
  // Handle form submission
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();  // Prevent the default form submission
    
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

              // Redirect to the homepage immediately
              window.location.href = 'index.html';
            } else {
              showMessage('User data not found. Redirecting...', 'signInMessage');
              setTimeout(() => window.location.href = 'index.html', 1000); // Fallback
            }
          })
          .catch((error) => {
            console.error('Error fetching user data from Firestore:', error);
            showMessage('Error fetching user data. Redirecting...', 'signInMessage');
            setTimeout(() => window.location.href = 'index.html', 1000); // Fallback
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

// Load booking information from Firestore
async function loadBookingInformation() {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const notificationDropdown = document.getElementById('notification-dropdown');
  if (user) {
    try {
      const q = query(collection(db, "bookingInformation"), where("userId", "==", user.userId));
      const querySnapshot = await getDocs(q);

      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push(doc.data());
      });

      // If bookings are found, display them
      if (bookings.length > 0) {
        displayBookingInformation(bookings);
        // Save booking info in localStorage to persist across page changes
        localStorage.setItem('bookings', JSON.stringify(bookings));
      } else {
        // If no bookings are found, clear localStorage and update UI
        localStorage.removeItem('bookings');
        notificationDropdown.innerHTML = '<p>No upcoming appointments.</p>';
      }
    } catch (error) {
      console.error("Error fetching booking information: ", error);
    }
  }
}

// Check for booking information on page load
document.addEventListener('DOMContentLoaded', function () {
  const storedBookings = JSON.parse(localStorage.getItem('bookings'));
  const notificationDropdown = document.getElementById('notification-dropdown');

  // Clear any stale notifications
  notificationDropdown.innerHTML = '';

  // Check if bookings exist in localStorage
  if (storedBookings && storedBookings.length > 0) {
    displayBookingInformation(storedBookings);
  } else {
    loadBookingInformation();  // Load bookings from Firestore if not in localStorage
  }
});

// Function to display booking information
function displayBookingInformation(bookings) {
  const notificationDropdown = document.getElementById('notification-dropdown');
  notificationDropdown.innerHTML = ''; // Clear existing notifications

  if (bookings.length > 0) {
    bookings.forEach((booking) => {
      const bookingHTML = `
        <div class="notification-item">
          <p>${booking.message}</p>
        </div>
      `;
      notificationDropdown.innerHTML += bookingHTML;
    });
  } else {
    // If no bookings are found, hide the notification dropdown
    notificationDropdown.innerHTML = '<p>No bookings found.</p>';
  }
}





// Handle Contact Form Submission and create booking info
document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('multiStepForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const user = JSON.parse(localStorage.getItem('loggedInUser')); // Get logged-in user UID

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const mobile = document.getElementById('mobile').value;
      const make = document.getElementById('make').value;
      const year = document.getElementById('year').value;
      const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(input => input.value);
      const selectedDate = document.getElementById('selectedDate').textContent; // Ensure selected date is properly captured
      const additionalInfo = document.getElementById('additional-info').value;

      try {
        // Ensure all values are correctly retrieved before sending to Firestore
        console.log({ name, email, mobile, make, year, services, selectedDate, additionalInfo });

        const docRef = doc(db, "contactForm", user.userId);  // Store by UID
        await setDoc(docRef, {
          name,
          email,
          mobile,
          make,
          year,
          services,
          selectedDate,
          additionalInfo,
          userId: user.userId,  // Associate the form submission with the logged-in user's UID
          timestamp: new Date().toISOString()
        });

        // Add a booking information in the `bookingInformation` collection
        const bookingRef = collection(db, "bookingInformation");
        await addDoc(bookingRef, {
          userId: user.userId,  // Use UID
          message: `Appointment booked for ${name} (${make} - ${year}) on ${selectedDate}. Services: ${services.join(', ')}`,
          timestamp: new Date().toISOString()
        });

        alert("Form submitted successfully!");

        // Clear the form
        contactForm.reset(); // Reset the form fields
      } catch (error) {
        console.error("Error submitting form: ", error);
        alert("Error submitting the form. Please try again.");
      }
    });
  }
});

// Load Booking Information on Page Load
document.addEventListener('DOMContentLoaded', async function () {
  const notificationDropdown = document.getElementById('notification-dropdown');
  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  if (user) {
    try {
      const q = query(collection(db, "bookingInformation"), where("userId", "==", user.userId));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        const bookingHTML = `
          <div class="notification-item">
            <p>${booking.message}</p>
          </div>
        `;
        notificationDropdown.innerHTML += bookingHTML;
      });
    } catch (error) {
      console.error("Error fetching booking information: ", error);
    }
  }
});
