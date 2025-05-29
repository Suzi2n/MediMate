import { useState, useRef } from "react";
import { Button } from "@mui/material";

export default function MicButton() {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const socket = new WebSocket("ws://localhost:5001"); // 백엔드 WebSocket 주소
      socket.binaryType = "arraybuffer";

      socketRef.current = socket;

      socket.onopen = () => {
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: 128000,
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => {
              socket.send(buffer);
            });
          }
        };

        recorder.start(250); // 250ms마다 오디오 전송
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        console.log("🎤 음성인식 시작");
      };

      socket.onerror = (err) => {
        console.error("WebSocket 연결 오류", err);
      };

    } catch (err) {
      console.error("마이크 접근 실패", err);
      alert("마이크 권한을 허용해주세요.");
    }
  };

  const stopRecording = () => {
 const recorder = mediaRecorderRef.current;
  if (recorder && recorder.state !== "inactive") {
    recorder.stop(); // 미디어 음성인식 중단
  }

  const socket = socketRef.current;
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(); // 소켓 종료
  }

  setIsRecording(false);
  console.log("🛑 음성인식 정지 및 소켓 종료");
  };

  return (
    <Button
      variant="contained"
      color={isRecording ? "error" : "primary"}
      onClick={isRecording ? stopRecording : startRecording}
      sx={{ mt: 2 }}
    >
      {isRecording ? "정지" : "음성 인식 시작"}
    </Button>
  );
}
