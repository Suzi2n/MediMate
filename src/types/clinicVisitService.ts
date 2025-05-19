// clinicVisitService.ts
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
  } from "firebase/firestore";
  import { db } from "../firebase";
  
  // 전체 조회
  export async function getClinicVisits(patientId: string) {
    const q = query(collection(db, "clinicVisits"), where("patientId", "==", patientId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  
  // 추가
  export async function addClinicVisit(patientId: string, date: string, note: string) {
    const docRef = await addDoc(collection(db, "clinicVisits"), {
      patientId,
      date,
      note,
    });
    return { id: docRef.id, patientId, date, note };
  }
  
  // 수정
  export async function updateClinicVisit(id: string, date: string, note: string) {
    const docRef = doc(db, "clinicVisits", id);
    await updateDoc(docRef, { date, note });
  }
  
  // 삭제
  export async function deleteClinicVisit(id: string) {
    const docRef = doc(db, "clinicVisits", id);
    await deleteDoc(docRef);
  }
  