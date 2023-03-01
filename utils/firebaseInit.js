import firebaseInit from "firebase";

const config = {
  apiKey: "AIzaSyBTOmwITsmDzfetwcoUhLNEWk_Qp2s88GU",
  authDomain: "fustuqa-erp.firebaseapp.com",
  projectId: "fustuqa-erp",
  storageBucket: "fustuqa-erp.appspot.com",
  messagingSenderId: "514166688110",
  appId: "1:514166688110:web:2846bc8b6ba5f2ba56197f",
  measurementId: "G-SFNGZTQNML",
};

if (!firebaseInit.apps.length) {
  firebaseInit.initializeApp(config);
}

// if (typeof window !== "undefined") {
//   // browser code
//   if (window.location.hostname === "localhost") {
//     firebaseInit.functions().useEmulator("http://localhost:5001");
//     firebaseInit.auth().useEmulator("http://localhost:9099");
//     firebaseInit.firestore().useEmulator("localhost", 8080);
//   }
// }

export default firebaseInit;
