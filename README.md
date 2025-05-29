# MediMate

이 프로젝트는 MediMate의 일환인 웹 기반 의료 관리 플랫폼으로, 의료진과 보호자(일반 사용자)가 대시보드를 통해 환자의 건강 정보를 효율적으로 확인할 수 있도록 지원합니다.
본 프로젝트에서는 다음과 같은 핵심 기능을 제공합니다:

- "증상 기록 및 건강 일지 관리"

- "약물 복용 이력 추적"

- "실시간 음성 인식을 통한 진료 기록 요약 및 관리"

이 저장소는 web 브랜치로, React 기반의 프론트엔드 애플리케이션을 포함하고 있습니다.     


## 🛠 기술 스택

- **프레임워크**: React
- **언어**: TypeScript
- **번들러**: Vite
- **스타일링**: Tailwind CSS, MUI (Material UI)
- **실시간 기능**: WebSocket
- **오디오 처리**: MediaRecorder API
- **알림 기능**: `onSnapshot()`을 이용한 승인/거절 상태 감지
- **API 연동**: Flask 서버 및 외부 STT/Summarization API



## 📁 폴더 구조
```
MediMate/
├── public/             # 정적 리소스
├── src/
│   ├── apis/           # 백엔드 API와의 통신을 담당하는 모듈
│   ├── assets/         # 이미지 및 스타일 파일
│   ├── components/     # 공통 컴포넌트
│   ├── contexts/       # 전역 상태 관리
│   ├── hooks/          # 커스텀 훅
│   ├── layouts/        # 레이아웃 컴포넌트
│   ├── pages/          # 페이지 단위 구성
│   ├── types/          # 타입 정의
│   ├── utils/          # 범용적인 로직 함수들을 정의
│   └── App.tsx         # 루트 컴포넌트
│   └── firebase.ts     # Firebase 설정
          ...
├── package.json
├── tsconfig.json
└── vite.config.ts

```

## ✅ 주요 기능
- 보호자(사용자) 및 의사 역할 기반 대시보드
- 진료 기록 -> 실시간 WebSocket 음성 전송 및 STT 결과 출력
- 증상 기록, 건강 일지, 약물 복용 이력 관리
- 환자 승인 기반 정보 접근 시스템
- Firestore 기반 데이터 저장 및 실시간 반영
- 반응형 UI 및 Skeleton UI 로딩 처리



## 🔗 앱과의 연동

- **공통 Firebase 백엔드(Firestore, Auth, Storage)**  
  동일한 계정으로 웹과 앱에서 모두 로그인 가능하며, 데이터는 실시간으로 동기화됩니다.

- **음성 인식 및 요약 결과 공유**  
  웹에서 수집된 실시간 음성 데이터는 STT 처리 후 웹 대시보드와 앱에서 요약 결과로 나타납니다.

- **접근 승인 기반 보안 시스템**  
  의료진이 환자 정보를 조회하면 환자(앱 사용자)가 알림을 통해 승인을 진행한 후에만 접근이 허용됩니다.


 
## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/Suzi2n/MediMate.git
cd MediMate
git checkout web
```
### 2. 의존성 설치
```bash
pnpm install
```
이후 라이브러리 추가 설치 필요

### 3. 개발 서버 실행
```bash
pnpm run dev
```

브라우저에서 http://localhost:5173 열기
