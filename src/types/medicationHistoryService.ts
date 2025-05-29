// src/types/medicationService.ts
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
import { db } from "../firebase"; // Firestore 인스턴스

export interface MedicationInput {
  name: string;
  dosage: string;
  time: string;
  notes: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes: string;
  createdAt: Timestamp;
}

export const getMedicationHistory = async (customId: string): Promise<Medication[]> => {
  const ref = collection(db, "medications", customId, "intakes");
  const q = query(ref, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      dosage: data.dosage,
      time: data.time,
      notes: data.notes,
      createdAt: data.createdAt,
    } as Medication;
  });
};

export const addMedicationRecord = async (customId: string, data: MedicationInput) => {
  const ref = collection(db, "medications", customId, "intakes");
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return {
    id: docRef.id,
    ...data,
    createdAt: Timestamp.now(),
  };
};

export const updateMedicationRecord = async (
  customId: string,
  id: string,
  data: Partial<MedicationInput>
) => {
  const ref = doc(db, "medications", customId, "intakes", id);
  await updateDoc(ref, data);
};

export const deleteMedicationRecord = async (customId: string, id: string) => {
  const ref = doc(db, "medications", customId, "intakes", id);
  await deleteDoc(ref);
};
