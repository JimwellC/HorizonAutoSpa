import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBhgSQmc0fowNrKueb2pc-UErxqVofdf5k",
    authDomain: "hoirzonautospa-database.firebaseapp.com",
    databaseURL: "https://hoirzonautospa-database-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hoirzonautospa-database",
    storageBucket: "hoirzonautospa-database.appspot.com",
    messagingSenderId: "473836923344",
    appId: "1:473836923344:web:4c568f295f54394776f1d5",
    measurementId: "G-KG9R92TJZY"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to add a new service
document.getElementById('addServiceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const serviceName = document.getElementById('newServiceName').value;
  const serviceDescription = document.getElementById('newServiceDescription').value;
  const serviceLogo = document.getElementById('newServiceLogo').value;

  try {
    await addDoc(collection(db, 'services'), {
      serviceName: serviceName,
      serviceDescription: serviceDescription,
      serviceLogo: serviceLogo
    });
    alert('Service added successfully!');
    loadServices(); // Refresh the service list
  } catch (error) {
    console.error('Error adding service: ', error);
  }
});

// Function to load services in the admin dashboard for editing/deleting
async function loadServices() {
  const servicesCol = collection(db, 'services');
  const serviceSnapshot = await getDocs(servicesCol);
  let serviceListHtml = '';

  serviceSnapshot.forEach((doc) => {
    const service = doc.data();
    const docId = doc.id; // The unique document ID for each service

    serviceListHtml += `
      <div>
        <h3>${service.serviceName}</h3>
        <p>${service.serviceDescription}</p>
        <p><img src="${service.serviceLogo}" width="100"></p>
        <button onclick="deleteService('${docId}')">Delete</button>
        <button onclick="editService('${docId}', '${service.serviceName}', '${service.serviceDescription}', '${service.serviceLogo}')">Edit</button>
      </div>
    `;
  });

  document.getElementById('serviceList').innerHTML = serviceListHtml;
}

// Function to delete a service
window.deleteService = async function(docId) {
  await deleteDoc(doc(db, 'services', docId));
  alert('Service deleted!');
  loadServices(); // Refresh the list after deletion
};

// Function to edit a service
window.editService = function(docId, name, description, logo) {
  // Fill the form with the current data
  document.getElementById('newServiceName').value = name;
  document.getElementById('newServiceDescription').value = description;
  document.getElementById('newServiceLogo').value = logo;

  // Update the document on form submission
  document.getElementById('addServiceForm').onsubmit = async (event) => {
    event.preventDefault();
    
    const updatedName = document.getElementById('newServiceName').value;
    const updatedDescription = document.getElementById('newServiceDescription').value;
    const updatedLogo = document.getElementById('newServiceLogo').value;

    const serviceRef = doc(db, 'services', docId);
    await updateDoc(serviceRef, {
      serviceName: updatedName,
      serviceDescription: updatedDescription,
      serviceLogo: updatedLogo
    });

    alert('Service updated!');
    loadServices(); // Refresh the list after update

    // Reset the form to add mode
    document.getElementById('addServiceForm').reset();
    document.getElementById('addServiceForm').onsubmit = addNewService; // Reset to the default form handler
  };
};

// Load services on page load
loadServices();
