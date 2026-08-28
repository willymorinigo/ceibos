import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json'));
const app = initializeApp(config);
const db = getFirestore(app, "ai-studio-3365dff4-cf3b-4e01-a475-5642f882c23b");
const docs = await getDocs(collection(db, "announcements"));
console.log("Found:", docs.size);
docs.forEach(d => console.log(d.data().title));
