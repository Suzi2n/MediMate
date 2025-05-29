/*
import { useState, useRef } from "react";
import { Button } from "@mui/material";

export default function MicButton() {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const socket = new WebSocket("ws://113.198.66.75:10088/ws/speech");
    socket.binaryType = "arraybuffer";

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket 연결 성공");

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
      console.log("🎤 음성 인식 시작");
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket 연결 오류", err);
      alert("WebSocket 연결에 실패했습니다.");
    };

    socket.onclose = (event) => {
      console.warn("⚠️ WebSocket 연결 종료", event);
    };

    // 추가: 연결 3초 안에 안 열리면 실패로 간주
    setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        console.error("⏱️ WebSocket 연결 시간 초과");
        alert("서버와의 연결이 지연되고 있습니다. 서버가 실행 중인지 확인하세요.");
      }
    }, 3000);

  } catch (err) {
    console.error("❌ 마이크 접근 실패", err);
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
*/

// MicButton.tsx
import { useState, useRef } from "react";
import { Button } from "@mui/material";

interface MicButtonProps {
  customId: string; // 식별자로 쓸 ID
  onSummary?: (summary: string) => void; // 요약 완료 콜백
}

export default function MicButton({ customId, onSummary }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const socket = new WebSocket("ws://113.198.66.75:10088/ws/speech");
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        // 1️⃣ 연결되자마자 customId 전송
        if (customId) {
          const initMessage = JSON.stringify({
            type: "init",
            customId: customId,
          });
          socket.send(initMessage);
          console.log("📤 customId 전송:", customId);
        }
        // MediaRecorder 설정 & 250ms 단위로 청크 전송
        const recorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: 128000,
        });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => socket.send(buffer));
          }
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        console.log("🎤 녹음 시작");
      };

      /* 일단 주석
      socket.onmessage = (event) => {
        // 서버에서 온 요약 결과 수신
        try {
          const msg = JSON.parse(event.data);
          if (msg.status === "done" && msg.summary) {
            onSummary?.(msg.summary);
          }
        } catch (e) {
          console.error("메시지 파싱 오류", e);
        }
      };
      */
      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.status === "done") {
          onSummary?.(msg.summary);
          // 요약 받으면 그제야 소켓 닫기
          socketRef.current?.close();
          setIsRecording(false);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket 오류", err);
        alert("WebSocket 연결에 실패했습니다.");
      };
      socket.onclose = () => {
        console.log("⏹ 소켓 닫힘");
        setIsRecording(false);
      };
    } catch (err) {
      console.error("마이크 오류", err);
      alert("마이크 권한을 허용해주세요.");
    }
  };

  /*
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    socketRef.current?.close();
    setIsRecording(false);
    console.log("🛑 녹음·전송 중단");
  };
  */

  const stopRecording = () => {
  mediaRecorderRef.current?.stop();

  const socket = socketRef.current;
  if (socket && socket.readyState === WebSocket.OPEN) {
    // 🎯 음성 전송 완료 후 JSON 메시지 전송
    const endMessage = JSON.stringify({
      type: "end",
      customId: customId,
    });
    socket.send(endMessage);
    console.log("📤 end 메시지 전송:", endMessage);

    socket.close(); // 소켓 닫기
  }

  setIsRecording(false);
  console.log("🛑 녹음·전송 중단");
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

