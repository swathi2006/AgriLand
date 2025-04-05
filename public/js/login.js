const firebaseConfig = {
    apiKey: "AIzaSyAXFRcRFFPuljTTQ1ZxeGvOsOQxy0Ul0ws",
    authDomain: "landconverter-82007.firebaseapp.com",
    projectId: "landconverter-82007",
    storageBucket: "landconverter-82007.firebasestorage.app",
    messagingSenderId: "931935330384",
    appId: "1:931935330384:web:41b2e0844c930e08ac7155",
    measurementId: "G-RRHTC12MHP"
    };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      const idToken = await result.user.getIdToken();
  
      const response = await fetch('/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idToken })
      });
  
      const data = await response.json();
      if (data.success) {
        
        window.location.href = "/";
      } else {
        alert("Login failed!");
      }
    } catch (err) {
      alert("please check your credentials");
    }
  });
  