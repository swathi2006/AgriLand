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

const form = document.getElementById("signupForm");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            // Save user in Firestore
            await fetch('/signup', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    uid: user.uid,
                    name,
                    email
                })
            });

            // ✅ Get Firebase ID token
            const idToken = await user.getIdToken();

            // ✅ Send token to backend for session storage
            await fetch('/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ idToken })
            });

          
            window.location.href = "/";
        })
        .catch(error => {
            alert(error.message);
        });
});
