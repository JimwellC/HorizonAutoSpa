// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
const db = getFirestore(app);

import { collection, getDocs } from "firebase/firestore";

async function fetchServices() {
  const servicesCollection = collection(db, "services");
  try {
    const snapshot = await getDocs(servicesCollection);
    const services = snapshot.docs.map(doc => doc.data());

    const servicesContainer = document.getElementById("cards");
    servicesContainer.innerHTML = '';

    services.forEach(service => {
      const serviceCard = `
        <div class="card">
          <div class="card-content">
            <img src="${service.image}" alt="${service.name}">
            <h2 class="service-text-red">${service.name}</h2>
            <p>${service.description}</p>
            <a href="${service.link}"><span>Read More</span></a>
          </div>
        </div>`;
      servicesContainer.innerHTML += serviceCard;
    });
  } catch (error) {
    console.error("Error fetching services:", error);
  }
}

document.addEventListener('DOMContentLoaded', fetchServices);
