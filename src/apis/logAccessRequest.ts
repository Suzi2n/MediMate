
export const requestAccessLog = async (searcherId: string, targetPatientId: string, searcherNickname: string) => {
  const res = await fetch("http://localhost:8001/api/access-log/request-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ searcherId, targetPatientId , searcherNickname}),
  });
  if (!res.ok) throw new Error("접근 요청 실패");
};