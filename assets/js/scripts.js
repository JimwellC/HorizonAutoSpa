/**
 * Slider
 */

const initSlider = () => {
  const imageList = document.querySelector(".slider-wrapper .image-list");
  const slideButtons = document.querySelectorAll(".slider-wrapper .slide-button");
  const sliderScrollbar = document.querySelector(".container-slide .slider-scrollbar");
  const scrollbarThumb = sliderScrollbar.querySelector(".scrollbar-thumb");
  const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
  
  // Handle scrollbar thumb drag
  scrollbarThumb.addEventListener("mousedown", (e) => {
      const startX = e.clientX;
      const thumbPosition = scrollbarThumb.offsetLeft;
      const maxThumbPosition = sliderScrollbar.getBoundingClientRect().width - scrollbarThumb.offsetWidth;
      
      // Update thumb position on mouse move
      const handleMouseMove = (e) => {
          const deltaX = e.clientX - startX;
          const newThumbPosition = thumbPosition + deltaX;

          // Ensure the scrollbar thumb stays within bounds
          const boundedPosition = Math.max(0, Math.min(maxThumbPosition, newThumbPosition));
          const scrollPosition = (boundedPosition / maxThumbPosition) * maxScrollLeft;
          
          scrollbarThumb.style.left = `${boundedPosition}px`;
          imageList.scrollLeft = scrollPosition;
      }

      // Remove event listeners on mouse up
      const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
      }

      // Add event listeners for drag interaction
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
  });

  // Slide images according to the slide button clicks
  slideButtons.forEach(button => {
      button.addEventListener("click", () => {
          const direction = button.id === "prev-slide" ? -1 : 1;
          const scrollAmount = imageList.clientWidth * direction;
          imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
  });

   // Show or hide slide buttons based on scroll position
  const handleSlideButtons = () => {
      slideButtons[0].style.display = imageList.scrollLeft <= 0 ? "none" : "flex";
      slideButtons[1].style.display = imageList.scrollLeft >= maxScrollLeft ? "none" : "flex";
  }

  // Update scrollbar thumb position based on image scroll
  const updateScrollThumbPosition = () => {
      const scrollPosition = imageList.scrollLeft;
      const thumbPosition = (scrollPosition / maxScrollLeft) * (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth);
      scrollbarThumb.style.left = `${thumbPosition}px`;
  }

  // Call these two functions when image list scrolls
  imageList.addEventListener("scroll", () => {
      updateScrollThumbPosition();
      handleSlideButtons();
  });
}

window.addEventListener("resize", initSlider);
window.addEventListener("load", initSlider);

  

/**
* MOBILE NAVBAR TOGGLE
*/
document.addEventListener('DOMContentLoaded', function() {
const navToggler = document.querySelector('[data-nav-toggler]');
const navbar = document.querySelector('[data-navbar]');
const closeBtn = document.querySelector('.navbar-close-btn');
const body = document.body;

// Navbar Toggle
navToggler.addEventListener('click', () => {
    navbar.classList.toggle('active');
    navToggler.classList.toggle('active');
    body.classList.toggle('active-navbar'); // Add class to body to push content down
});

// Close Navbar when clicking the close button
closeBtn.addEventListener('click', () => {
    navbar.classList.remove('active');
    navToggler.classList.remove('active');
    body.classList.remove('active-navbar'); // Remove class to reset content position
});

// Close navbar if clicked outside
document.addEventListener('click', function(event) {
    if (!navbar.contains(event.target) && !navToggler.contains(event.target)) {
        navbar.classList.remove('active');
        navToggler.classList.remove('active');
        body.classList.remove('active-navbar'); // Remove class if clicked outside
    }
});
});

  //Video Slider


  document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('.vid-content');
  
    videos.forEach(video => {
      // Play video on hover
      video.addEventListener('mouseenter', function() {
        video.play();
      });
  
      // Pause and reset video when unhovered
      video.addEventListener('mouseleave', function() {
        video.pause();
        video.currentTime = 0; // Reset the video to the beginning
      });
    });
  });
  




/**
 * CONTACT FORM
 */
/**
 * CONTACT FORM
 */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('multiStepForm');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const formSteps = Array.from(document.querySelectorAll('.form-step'));
  let currentStep = 0;

  let formData = {
    name: '',
    email: '',
    mobile: '',
    make: '',
    year: '',
    services: [],
    date: '',
    additionalInfo: ''
  };

  // Show the current step
  function showStep(stepIndex) {
    formSteps.forEach((step, index) => {
      step.style.display = index === stepIndex ? 'block' : 'none';
    });
    document.getElementById('currentStep').textContent = stepIndex + 1;
  }

  // Show the initial step
  showStep(currentStep);

  // Handle next-step buttons
  document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', function () {
      if (currentStep < formSteps.length - 1) {
        currentStep++;
        updateFormData();
        showStep(currentStep);
      }
    });
  });

  // Handle previous-step buttons
  document.querySelectorAll('.prev-step').forEach(button => {
    button.addEventListener('click', function () {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Function to update formData at each step
  function updateFormData() {
    formData = {
      name: document.getElementById('name')?.value || '',
      email: document.getElementById('email')?.value || '',
      mobile: document.getElementById('mobile')?.value || '',
      make: document.getElementById('make')?.value || '',
      year: document.getElementById('year')?.value || '',
      services: Array.from(document.querySelectorAll('input[name="services"]:checked')).map(input => input.value),
      date: document.getElementById('selectedDate')?.textContent || '',
      additionalInfo: document.getElementById('additional-info')?.value || ''
    };
  }

  // Handle form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();  // Prevent the default form submission

    // Update form data one last time before submission
    updateFormData();

    // Log the formData for debugging
    console.log(formData);

    // Validate required fields before submitting to Firebase
    if (!formData.name || !formData.email || !formData.mobile) {
      alert('Please fill out all required fields.');
      return;
    }

    // Dispatch the form data to firebaseauth.js
    const submitEvent = new CustomEvent('formSubmitted', { detail: formData });
    document.dispatchEvent(submitEvent);

    // The notifications will be handled by firebaseauth.js, no need to duplicate logic here
    form.reset();  // Reset the form fields after submission
    currentStep = 0;  // Reset the form step to the first step
    showStep(currentStep);  // Show the first step
  });
});



  // // Handle form submission
  // multiStepForm.addEventListener('submit', function (event) {
  //   event.preventDefault();

  //   // Perform any necessary validation or data handling here
  //   alert('Form submitted successfully!');

  //   // Reset the form after submission
  //   multiStepForm.reset();

  //   // Reset the form steps to the first step
  //   currentStep = 0;
  //   showStep(currentStep);
  // });

/**
Reaction Handling
*/

document.addEventListener('DOMContentLoaded', function() {
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
  document.querySelector('.submit-review').addEventListener('click', () => {
      const reviewText = reviewTextarea.value;

      if (!selectedReaction) {
          alert('Please select a reaction before submitting your feedback.');
          return;
      }

      if (reviewText.trim() === '') {
          alert('Please provide some feedback before submitting.');
          return;
      }

      // You can send this data to a server or process it further
      console.log('Selected Reaction:', selectedReaction);
      console.log('Customer Review:', reviewText);

      alert('Thank you for your feedback!');

      // Reset feedback form
      reactionMessage.textContent = '';
      reactionMessage.style.opacity = '0';
      selectedReaction = '';
      reviewTextarea.value = ''; // Clear the textarea
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const calendarElement = document.getElementById('calendar');
  const selectedDateElement = document.getElementById('selectedDate');
  const monthSelector = document.getElementById('monthSelector');
  const yearSelector = document.getElementById('yearSelector');
  let selectedDay = null;

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Populate month and year selectors
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = month;
    monthSelector.appendChild(option);
  });

  // Year selector (Range from 2020 to 2030)
  for (let year = 2020; year <= 2030; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelector.appendChild(option);
  }

  // Create header for days of the week
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = day;
    calendarElement.appendChild(dayHeader);
  });

  // Function to generate the calendar days for a given month and year
  function generateCalendar(month, year) {
    // Clear previous days
    while (calendarElement.children.length > 7) {
      calendarElement.removeChild(calendarElement.lastChild);
    }

    // Get number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Get the first day of the month

    // Add empty divs for the days before the 1st day
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDiv = document.createElement('div');
      calendarElement.appendChild(emptyDiv);
    }

    // Create the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.textContent = day;
      dayElement.addEventListener('click', () => {
        if (selectedDay) {
          selectedDay.classList.remove('selected');
        }
        dayElement.classList.add('selected');
        selectedDay = dayElement;
        selectedDateElement.textContent = `${months[month]} ${day}, ${year}`;
      });
      calendarElement.appendChild(dayElement);
    }
  }

  // Event listener for when the month or year is changed
  monthSelector.addEventListener('change', () => {
    generateCalendar(parseInt(monthSelector.value), parseInt(yearSelector.value));
  });

  yearSelector.addEventListener('change', () => {
    generateCalendar(parseInt(monthSelector.value), parseInt(yearSelector.value));
  });

  // Initialize the calendar with the current month and year
  const today = new Date();
  monthSelector.value = today.getMonth();
  yearSelector.value = today.getFullYear();
  generateCalendar(today.getMonth(), today.getFullYear());
});



/**
* Notification
*/
document.addEventListener('DOMContentLoaded', function() {
const notificationIcon = document.getElementById('notification-icon');
const notificationDropdown = document.getElementById('notification-dropdown');

// Toggle the notification dropdown when the bell icon is clicked
notificationIcon.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the dropdown from closing immediately
    notificationDropdown.classList.toggle('active');
});

// Close the dropdown if clicked outside
document.addEventListener('click', function(event) {
    if (!notificationIcon.contains(event.target) && !notificationDropdown.contains(event.target)) {
        notificationDropdown.classList.remove('active');
    }
});
});





/**
* Sign/Login
*/
document.addEventListener('DOMContentLoaded', function () {
const authIcon = document.querySelector('.auth-icon');

// Retrieve the user data from localStorage
const user = JSON.parse(localStorage.getItem('loggedInUser'));

if (user) {
  // User is logged in: show profile icon with first name and Logout option
  authIcon.innerHTML = `
    <a href="#" class="profile-icon-link"><i class="fas fa-user-circle"></i></a>
    <div class="profile-dropdown" style="display: none;">
      <p>Welcome, ${user.username}</p> <!-- Display the first and last name -->
      <a href="#" id="logout">Logout</a>
    </div>
  `;

  // Toggle the profile dropdown menu
  authIcon.querySelector('.profile-icon-link').addEventListener('click', function (event) {
    event.preventDefault();
    const dropdown = document.querySelector('.profile-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });

  // Handle logout functionality
  const logoutBtn = document.getElementById('logout');
  logoutBtn.addEventListener('click', function (event) {
    event.preventDefault();
    // Clear user data from localStorage to log out
    localStorage.removeItem('loggedInUser');
    alert('You have been logged out.');
    window.location.href = 'login.html'; // Redirect to the login page after logout
  });

} else {
  // User is not logged in: show profile icon with Login/Sign Up option
  authIcon.innerHTML = `
    <a href="#" class="profile-icon-link"><i class="fas fa-user-circle"></i></a>
    <div class="profile-dropdown" style="display: none;">
      <a href="login.html">Login</a>
      <hr>
      <a href="register.html">Sign Up</a>
    </div>
  `;

  // Toggle the login/sign-up dropdown
  authIcon.querySelector('.profile-icon-link').addEventListener('click', function (event) {
    event.preventDefault();
    const dropdown = document.querySelector('.profile-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
}
});


// document.addEventListener('DOMContentLoaded', function() {
//   const loginForm = document.getElementById('login-form');
//   const signupForm = document.getElementById('signup-form');
//   const showSignupLink = document.getElementById('show-signup');
//   const showLoginLink = document.getElementById('show-login');

//   // Toggle to Sign-Up Form
//   showSignupLink.addEventListener('click', function(event) {
//     event.preventDefault();
//     loginForm.style.display = 'none';
//     signupForm.style.display = 'block';
//   });

//   // Toggle to Login Form
//   showLoginLink.addEventListener('click', function(event) {
//     event.preventDefault();
//     signupForm.style.display = 'none';
//     loginForm.style.display = 'block';
//   });

//   // Handle login form submission
//   loginForm.addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent the form from submitting the traditional way

//     const email = document.getElementById('login-email').value;
//     const password = document.getElementById('login-password').value;

//     // Simulate checking credentials
//     const storedUser = JSON.parse(localStorage.getItem('user')); // Fetch user data from localStorage

//     if (storedUser && storedUser.email === email && storedUser.password === password) {
//       // Successful login
//       alert('Login successful! Redirecting to homepage...');
//       window.location.href = 'index.html'; // Redirect to index.html
//     } else {
//       alert('Incorrect email or password.');
//     }
//   });

//   // Handle sign-up form submission
//   signupForm.addEventListener('submit', function(event) {
//     event.preventDefault(); // Prevent the form from submitting the traditional way

//     const username = document.getElementById('signup-username').value;
//     const email = document.getElementById('signup-email').value;
//     const password = document.getElementById('signup-password').value;

//     // Store user data in localStorage (simulating account creation)
//     localStorage.setItem('user', JSON.stringify({ username, email, password }));
//     alert('Account created successfully! Please login.');

//     // Automatically switch to the login form after successful sign-up
//     signupForm.style.display = 'none';
//     loginForm.style.display = 'block';
//   });
// });




document.addEventListener('DOMContentLoaded', function() {
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Show the button when scrolled down 500px
window.addEventListener('scroll', function() {
  if (window.scrollY > 500) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }
});

// Scroll to top when the button is clicked
scrollToTopBtn.addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Smooth scroll effect
  });
});
});


//FEATURE PAGE IMAGE SLIDER

let items = document.querySelectorAll('.feature-slider .feature-list .feature-item');
let next = document.getElementById('feature-next');
let prev = document.getElementById('feature-prev');
let thumbnails = document.querySelectorAll('.thumbnail .feature-item');

// config param
let countItem = items.length;
let itemActive = 0;
// event next click
next.onclick = function(){
  itemActive = itemActive + 1;
  if(itemActive >= countItem){
      itemActive = 0;
  }
  showSlider();
}
//event prev click
prev.onclick = function(){
  itemActive = itemActive - 1;
  if(itemActive < 0){
      itemActive = countItem - 1;
  }
  showSlider();
}
// auto run slider
let refreshInterval = setInterval(() => {
  next.click();
}, 5000)
function showSlider(){
  // remove item active old
  let itemActiveOld = document.querySelector('.feature-slider .feature-list .feature-item.active');
  let thumbnailActiveOld = document.querySelector('.thumbnail .feature-item.active');
  itemActiveOld.classList.remove('active');
  thumbnailActiveOld.classList.remove('active');

  // active new item
  items[itemActive].classList.add('active');
  thumbnails[itemActive].classList.add('active');

  // clear auto time run slider
  clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
      next.click();
  }, 5000)
}

// click thumbnail
thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener('click', () => {
      itemActive = index;
      showSlider();
  })
})


//POPUP OVERLAY
window.addEventListener('scroll', function() {
const popup = document.getElementById('popup');
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
const scrollPercent = (scrollTop / windowHeight) * 100;

if (scrollPercent > 50 && !popup.classList.contains('shown')) {
  popup.style.display = 'flex';
  popup.classList.add('shown'); // Prevent popup from showing again
}
});

// Close popup functionality
document.getElementById('closePopup').addEventListener('click', function() {
document.getElementById('popup').style.display = 'none';
});

// Close popup when clicking outside the content area (optional)
window.addEventListener('click', function(event) {
const popup = document.getElementById('popup');
if (event.target === popup) {
  popup.style.display = 'none';
}
});

