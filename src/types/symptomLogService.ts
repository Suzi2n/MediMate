
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export interface SymptomInput {
  name: string;
  intensity: number;
  duration: string;
  note: string;
  action: string;
  date: string; 
}

export interface SymptomRecord extends SymptomInput {
  id: string;
  createdAt: Timestamp;
}



export const getSymptomRecords = async (customId: string): Promise<SymptomRecord[]> => {
  const ref = collection(db, "symptoms", customId, "records");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      intensity: data.intensity,
      duration: data.duration,
      note: data.note,
      action: data.action,
      date: data.date,
      createdAt: data.createdAt,
    } as SymptomRecord;
  });
};


export const addSymptomRecord = async (customId: string, data: SymptomInput): Promise<SymptomRecord> => {
  const ref = collection(db, "symptoms", customId, "records");
  const createdAt = Timestamp.now();
  const docRef = await addDoc(ref, {
    ...data,
    createdAt,
  });
  return { id: docRef.id, ...data, createdAt };
};


export const updateSymptomRecord = async (
  customId: string,
  id: string,
  data: Partial<SymptomInput>
): Promise<void> => {
  const ref = doc(db, "symptoms", customId, "records", id);
  await updateDoc(ref, data);
};


export const deleteSymptomRecord = async (
  customId: string,
  id: string
): Promise<void> => {
  const ref = doc(db, "symptoms", customId, "records", id);
  await deleteDoc(ref);
};
