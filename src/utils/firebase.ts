/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { initializeApp } from "firebase/app";
import { getStorage , ref, uploadBytes, getDownloadURL} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBQtmI6ni8VMW4SNDUGe1_XlU8EQyS46_g",
  authDomain: "musahibeaz.firebaseapp.com",
  projectId: "musahibeaz",
  storageBucket: "musahibeaz.firebasestorage.app",
  messagingSenderId: "783363350054",
  appId: "1:783363350054:web:91a89ebc0c8af83c8150e7",
};

const app = initializeApp(firebaseConfig);

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const storage = getStorage(app);

export { storage, uploadBytes, getDownloadURL, ref };
