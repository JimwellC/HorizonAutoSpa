// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, updateDoc, setDoc, doc, deleteDoc, getDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
          uid: user.uid,
          role: 'customer'
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
      .then(async (userCredential) => {
        const user = userCredential.user;

        try {
          // Fetch the user's details from Firestore using their UID
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            localStorage.setItem('loggedInUser', JSON.stringify(userData));

            // Role-based redirection
            if (userData.role === 'admin') {
              window.location.href = './dashboard/dashboardadmin.html';  // Redirect to the admin dashboard
            } else {
              window.location.href = 'index.html';  // Redirect to the homepage for non-admin users
            }
          } else {
            // If user data is not found in Firestore
            showMessage('User data not found. Redirecting...', 'signInMessage');
            setTimeout(() => window.location.href = 'index.html', 1000);  // Fallback redirect
          }
        } catch (error) {
          // Error fetching user data from Firestore
          console.error('Error fetching user data from Firestore:', error);
          showMessage('Error fetching user data. Redirecting...', 'signInMessage');
          setTimeout(() => window.location.href = 'index.html', 1000);  // Fallback redirect
        }
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
      timestamp: new Date().toISOString(),
      status: 'pending'
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


//Admin Dashboard

// Get registered users
async function getRegisteredUsers() {
	const querySnapshot = await getDocs(collection(db, "users"));
	const userCount = querySnapshot.size;
	document.getElementById('registeredUsersCount').innerText = userCount;
  }

// Get Total Services Acquired
async function getTotalServices() {
const querySnapshot = await getDocs(collection(db, "contactForm"));
let totalServices = 0;

querySnapshot.forEach((doc) => {
	const data = doc.data();
	if (data.services) {
	totalServices += data.services.length;
	}
});

document.getElementById('totalServicesAcquired').innerText = totalServices;
}

async function getTotalFeedbacks() {
  const querySnapshot = await getDocs(collection(db, "reactions"));
  const feedbackCount = querySnapshot.size;  // Get the number of feedbacks
  document.getElementById('totalFeedbacks').innerText = feedbackCount;
}

// Fetch recent orders from Firestore
async function getRecentOrders() {
  const querySnapshot = await getDocs(collection(db, "contactForm")); // Fetch data from Firestore

  const ordersTable = document.querySelector("#ordersTableBody"); // Targeting the body of the orders table

  // Clear the table first
  ordersTable.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const orderData = doc.data();
    const orderId = doc.id; // Get the document ID
    const orderRow = document.createElement('tr');

    // Convert services array to a string
    const servicesAcquired = orderData.services ? orderData.services.join(", ") : "No Services";

    // Convert the 'date' field to a readable format and create a Date object for comparison
    const serviceDate = orderData.date ? new Date(orderData.date) : null;
    const currentDate = new Date();

    // Determine status based on whether the current date is before or after the service date
    let status = "Pending";
    if (orderData.status === "accepted") {
      status = "Accepted";
    } else if (orderData.status === "denied") {
      status = "Denied";
    } else if (serviceDate && currentDate > serviceDate) {
      status = "Completed";
    }

    // Format the service date for display
    const formattedServiceDate = serviceDate ? serviceDate.toLocaleDateString() : "Not Scheduled";

    // Create HTML content for the row with conditional buttons
    orderRow.innerHTML = `
      <td>${orderData.name || 'No Name'}</td>
      <td>${new Date(orderData.timestamp).toLocaleDateString()}</td> <!-- Order date -->
      <td>${servicesAcquired}</td> <!-- Services acquired -->
      <td>${formattedServiceDate}</td> <!-- Service date -->
      <td><span class="status ${status.toLowerCase()}">${status}</span></td> <!-- Status: Pending, Accepted, Denied, or Completed -->
      <td>
        ${status === "Pending"
          ? `
            <button class="accept-booking" data-id="${orderId}">Accept</button>
            <button class="deny-booking" data-id="${orderId}">Deny</button>
          `
          : status === "Accepted"
          ? `<button class="deny-booking" data-id="${orderId}">Deny (Delete)</button>`
          : status === "Completed"
          ? `<button class="delete-booking" data-id="${orderId}">Delete Record</button>`
          : '' /* No action for Denied status */
        }
      </td> <!-- Action buttons based on status -->
    `;

    // Append the row to the table
    ordersTable.appendChild(orderRow);
  });

  // Attach event listeners to the Accept button for Pending status
  document.querySelectorAll('.accept-booking').forEach(button => {
    button.addEventListener('click', (e) => {
      const orderId = e.target.getAttribute('data-id');
      updateBookingStatus(orderId, 'accepted'); // Call the function to accept the booking
    });
  });

  // Attach event listeners to the Deny button for Pending and Accepted status
  document.querySelectorAll('.deny-booking').forEach(button => {
    button.addEventListener('click', (e) => {
      const orderId = e.target.getAttribute('data-id');
      const status = e.target.closest('tr').querySelector('.status').textContent.trim();
      if (status === 'Accepted') {
        deleteBooking(orderId); // Call delete if the booking is in Accepted status
      } else {
        denyBooking(orderId); // Call deny function for Pending status
      }
    });
  });

  // Attach event listeners to the Delete Record buttons for Completed status
  document.querySelectorAll('.delete-booking').forEach(button => {
    button.addEventListener('click', (e) => {
      const orderId = e.target.getAttribute('data-id');
      deleteBooking(orderId); // Call the function to delete the booking
    });
  });
}

// Function to update the booking status to "accepted"
async function updateBookingStatus(orderId, status) {
  try {
    const orderDocRef = doc(db, 'contactForm', orderId); // Get the reference to the document

    // Update the document's status
    await updateDoc(orderDocRef, { status: status });

    alert("Booking has been accepted!");
    getRecentOrders(); // Refresh the bookings list
  } catch (error) {
    console.error("Error updating booking status:", error);
    alert("Failed to accept the booking. Please try again.");
  }
}

// Function to deny the booking (change status to Denied)
async function denyBooking(orderId) {
  try {
    const orderDocRef = doc(db, 'contactForm', orderId);
    await updateDoc(orderDocRef, { status: "denied" });
    alert("Booking has been denied.");
    getRecentOrders(); // Refresh the bookings list
  } catch (error) {
    console.error("Error denying booking:", error);
    alert("Failed to deny the booking. Please try again.");
  }
}

// Function to delete the booking from Firestore
async function deleteBooking(orderId) {
  if (confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
    try {
      const orderDocRef = doc(db, 'contactForm', orderId); // Get the reference to the document
      await deleteDoc(orderDocRef); // Delete the document from Firestore
      alert("Booking has been deleted.");
      getRecentOrders(); // Refresh the bookings list
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete the booking. Please try again.");
    }
  }
}
// Fetch all users from Firestore and display them in the "User Login" section
async function getUsers() {
  const usersList = document.querySelector(".todo-list"); // Targeting the 'todo-list' element

  // Clear the current list
  usersList.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "users")); // Fetching from the 'users' collection

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id; // Get the document ID for deletion
      const userName = userData.username || "Unknown User"; // Use 'username' or fallback if not available
      const userRole = userData.role || "user"; // Check if the user has a role, default to "user"

      // Skip users with the role of "admin"
      if (userRole === "admin") {
        return; // Skip adding admins to the list
      }

      // Create list item for each user
      const userItem = document.createElement('li');
      userItem.classList.add('completed'); // Optional: adjust class based on condition
      userItem.innerHTML = `
        <p>${userName}</p>
        <button class="delete-user" data-id="${userId}">Delete</button>
      `;

      // Append the user item to the list
      usersList.appendChild(userItem);
    });

    // Attach event listeners to each delete button
    const deleteButtons = document.querySelectorAll('.delete-user');
    deleteButtons.forEach((button) => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-id');
        await deleteUser(userId); // Call the function to delete the user
      });
    });

  } catch (error) {
    console.error("Error fetching users: ", error);
  }
}

// Function to delete a user and their orders from Firestore
async function deleteUser(userId) {
  try {
    const userRef = doc(db, "users", userId); // Get the user document reference
    const userDoc = await getDoc(userRef); // Fetch the user document to verify existence

    if (userDoc.exists()) {
      // Delete the user document
      await deleteDoc(userRef);
      console.log("User deleted successfully!");

      // Now delete any related orders in the "contactForm" or "orders" collection
      const ordersQuerySnapshot = await getDocs(query(collection(db, "contactForm"), where("userId", "==", userId)));

      const deletePromises = [];
      ordersQuerySnapshot.forEach((orderDoc) => {
        deletePromises.push(deleteDoc(orderDoc.ref)); // Push each delete operation to the array
      });

      // Wait for all order deletions to complete
      await Promise.all(deletePromises);
      console.log("Associated orders deleted successfully!");

      alert("User and their associated orders deleted successfully!");

    } else {
      console.error("No such user document exists!");
      alert("Error: User document does not exist.");
    }

    // Refresh the user list after deletion
    getUsers();
  } catch (error) {
    console.error("Error deleting user and orders: ", error);
    alert("Error deleting user and their orders. Please try again.");
  }
}


document.addEventListener('DOMContentLoaded', () => {
	getRegisteredUsers();
	getTotalServices();
  getTotalFeedbacks();
  getRecentOrders();
  getUsers();
  });

// Fetch feedback from Firestore and display it
async function fetchFeedback() {
  const feedbackTableBody = document.getElementById('feedbackTableBody');
  
  // Clear the table body before adding new feedbacks
  feedbackTableBody.innerHTML = '';

  try {
    // Get feedback from the "reactions" collection
    const querySnapshot = await getDocs(collection(db, 'reactions'));

    querySnapshot.forEach((doc) => {
      const feedbackData = doc.data();
      const feedbackId = doc.id; // Get document ID for deletion

      // Create a row for each feedback
      const feedbackRow = document.createElement('tr');
      feedbackRow.innerHTML = `
        <td>${feedbackData.customerName || 'Anonymous'}</td>
        <td>${feedbackData.reaction}</td>
        <td>${feedbackData.review || 'No review provided.'}</td>
        <td>${new Date(feedbackData.timestamp).toLocaleString()}</td>
        <td><button class="delete-feedback" data-id="${feedbackId}">Delete</button></td>
      `;

      // Append the row to the table body
      feedbackTableBody.appendChild(feedbackRow);
    });

    // Attach delete event to all delete buttons
    document.querySelectorAll('.delete-feedback').forEach(button => {
      button.addEventListener('click', async (e) => {
        const feedbackId = e.target.getAttribute('data-id');
        await deleteFeedback(feedbackId);
      });
    });

  } catch (error) {
    console.error("Error fetching feedback: ", error);
  }
}

// Function to delete feedback from Firestore
async function deleteFeedback(feedbackId) {
  try {
    await deleteDoc(doc(db, 'reactions', feedbackId));
    alert('Feedback deleted successfully!');
    fetchFeedback(); // Refresh the feedback list after deletion
  } catch (error) {
    console.error('Error deleting feedback:', error);
    alert('Failed to delete feedback. Please try again.');
  }
}

// Call the fetchFeedback function when the page loads
document.addEventListener('DOMContentLoaded', fetchFeedback);



// Function to fetch and display analytics data
async function fetchAnalytics() {
  const totalFeedbacksElement = document.getElementById('totalFeedbacks');
  const positiveReactionsElement = document.getElementById('positiveReactions');
  const negativeReactionsElement = document.getElementById('negativeReactions');

  try {
    const feedbackQuerySnapshot = await getDocs(collection(db, 'reactions')); // Fetch feedbacks from 'reactions'

    let totalFeedbacks = 0;
    let positiveReactions = 0;
    let negativeReactions = 0;

    const reactionCounts = {
      excited: 0,
      happy: 0,
      neutral: 0,
      sad: 0,
      angry: 0
    };

    // Log if there are any documents in the collection
    console.log("Total feedbacks fetched:", feedbackQuerySnapshot.size);

    feedbackQuerySnapshot.forEach((doc) => {
      const feedbackData = doc.data();
      totalFeedbacks++;

      // Track reactions
      const reaction = feedbackData.reaction;
      console.log("Processing feedback:", feedbackData);  // Log each feedback document

      if (reaction) {
        console.log("Found reaction:", reaction);  // Log each reaction found

        // Increment the count for each reaction type
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;

        // Categorize positive and negative reactions
        if (reaction === 'excited' || reaction === 'happy') {
          positiveReactions++;
        } else if (reaction === 'sad' || reaction === 'angry') {
          negativeReactions++;
        }
      } else {
        console.log("No reaction field found in document:", doc.id);
      }
    });

    // Update the UI with metrics
    totalFeedbacksElement.textContent = totalFeedbacks;
    positiveReactionsElement.textContent = positiveReactions;
    negativeReactionsElement.textContent = negativeReactions;

    // Log the counts for debugging
    console.log("Positive Reactions:", positiveReactions);
    console.log("Negative Reactions:", negativeReactions);
    console.log("Reaction counts:", reactionCounts);

    // Display chart with reaction breakdown
    displayReactionChart(reactionCounts);

  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
}

// Function to display the reaction breakdown chart using Chart.js
function displayReactionChart(reactionCounts) {
  const ctx = document.getElementById('reactionChart').getContext('2d');
  
  console.log("Initializing chart with data:", reactionCounts);

  const reactionChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['excited', 'happy', 'neutral', 'sad', 'angry'],
      datasets: [{
        label: 'Customer Reactions',
        data: [
          reactionCounts['excited'],
          reactionCounts['happy'],
          reactionCounts['neutral'],
          reactionCounts['sad'],
          reactionCounts['angry']
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)', // excited - light blue
          'rgba(54, 162, 235, 0.2)', // happy - blue
          'rgba(255, 206, 86, 0.2)', // neutral - yellow
          'rgba(255, 99, 132, 0.2)', // sad - red
          'rgba(153, 102, 255, 0.2)' // angry - purple
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

// Call the fetchAnalytics function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchAnalytics();
});


document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.querySelector('.logout');

  // Add click event listener to the logout button
  logoutButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default link behavior

    const auth = getAuth(); // Initialize Firebase Auth

    // Sign out the user
    signOut(auth)
      .then(() => {
        // Successful logout
        alert("Logged out successfully!");
        window.location.href = "../login.html"; // Redirect to the login page
      })
      .catch((error) => {
        // Handle errors
        console.error("Error logging out:", error);
        alert("An error occurred during logout. Please try again.");
      });
  });
});


