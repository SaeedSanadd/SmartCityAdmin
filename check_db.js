import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD-MG9e8-PtnOAgP5mvf8LDyPMr4OijUAg",
    authDomain: "waste-report-81922.firebaseapp.com",
    projectId: "waste-report-81922",
    storageBucket: "waste-report-81922.firebasestorage.app",
    messagingSenderId: "281908166078",
    appId: "1:281908166078:web:8ed78ed67668fa002bcdef",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
async function run() {
  console.log("Fetching reports...");
  const querySnapshot = await getDocs(collection(db, "reports"));
  console.log(`Found ${querySnapshot.size} reports total.`);
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}, Type: ${data.type}, Status: "${data.status}", lat: ${data.lat}, lng: ${data.lng}, keys: ${Object.keys(data).join(", ")}`);
  });

  console.log("\nFetching bins...");
  const binsSnapshot = await getDocs(collection(db, "Bins"));
  console.log(`Found ${binsSnapshot.size} bins total.`);
  binsSnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}, Status: "${data.status}", latitude: ${data.latitude}, longitude: ${data.longitude}, assignedTo: ${data.assignedTo}`);
  });
  process.exit(0);
}
run().catch(console.error);
