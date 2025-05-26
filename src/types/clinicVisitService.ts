import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";

// 진료기록 타입 정의
export interface ClinicVisit {
  id: string;
  clinicDate: Timestamp;
  doctorName: string;
  originalText: string;
  summaryText: string;
  translatedText: string;
  createdAt: Timestamp;
}

// 전체 조회
export const getClinicVisits = async (
  customId: string
): Promise<ClinicVisit[]> => {
  const visitsRef = collection(db, `clinicRecords/${customId}/visits`);

  const q = query(visitsRef, orderBy("clinicDate", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      clinicDate: data.clinicDate as Timestamp,
      doctorName: data.doctorName,
      originalText: data.originalText,
      summaryText: data.summaryText,
      translatedText: data.translatedText,
       createdAt: data.createdAt as Timestamp,
    };
  });
};

// 추가
export const addClinicVisit = async (
  customId: string,
  visit: Omit<ClinicVisit, "id" | "createdAt">
): Promise<ClinicVisit> => {
  const ref = collection(db, `clinicRecords/${customId}/visits`);
  const now = Timestamp.now();
  const docRef = await addDoc(ref, {
    ...visit,
    createdAt: now,
  });

  return {
    id: docRef.id,
    ...visit,
    createdAt: now,
  };
};

// 수정
export const updateClinicVisit = async (
  customId: string,
  visitId: string,
  updated: Partial<ClinicVisit>
): Promise<void> => {
  const docRef = doc(db, `clinicRecords/${customId}/visits/${visitId}`);
  await updateDoc(docRef, updated);
};

// 삭제
export const deleteClinicVisit = async (
  customId: string,
  visitId: string
): Promise<void> => {
  const docRef = doc(db, `clinicRecords/${customId}/visits/${visitId}`);
  await deleteDoc(docRef);
};
