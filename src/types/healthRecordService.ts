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

export interface RecordInput {
  date: Timestamp;
  content: string;
}

export interface HealthRecord {
  id: string;
  date: Timestamp;
  content: string;
  createdAt: Timestamp;
}

export const getHealthRecords = async (customId: string): Promise<HealthRecord[]> => {
  const ref = collection(db, "healthRecords", customId, "records");
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      date: data.date,
      content: data.content,
      createdAt: data.createdAt,
    } as HealthRecord;
  });
};

export const addHealthRecord = async (customId: string, record: RecordInput) => {
  const ref = collection(db, "healthRecords", customId, "records");
  const docRef = await addDoc(ref, {
    ...record,
    createdAt: Timestamp.now(),
  });

  return {
    id: docRef.id,
    ...record,
    createdAt: Timestamp.now(),
  };
};

export const updateHealthRecord = async (
  customId: string,
  recordId: string,
  updated: Partial<RecordInput>
): Promise<void> => {
  const docRef = doc(db, "healthRecords", customId, "records", recordId);
  await updateDoc(docRef, updated);
};

export const deleteHealthRecord = async (
  customId: string,
  recordId: string
): Promise<void> => {
  const docRef = doc(db, "healthRecords", customId, "records", recordId);
  await deleteDoc(docRef);
};
