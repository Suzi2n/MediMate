import { CommonResponse } from "./common.ts";


// 회원가입
export type RequestSignupDto = {
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    password: string;
    //phone_number: string;
};

export type ResponseSignupDto = CommonResponse<{
    id : number;
    name : string;
    email : string;
    bio : string | null;
    avatar : string | null;
    createdAt : Date;
    updatedAt : Date;

}>;


// 로그인
export type RequestSigninDto = {
    email: string;
    password: string;
};


export type ResponseSigninDto = {
    id: number;
    name: string;
};


// 내 정보 조회
export type ResponseMyInfoDto = CommonResponse<{
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;



// 응급 정보
export type EmergencyInfo = {
    name: string;
    birth: string;
    bloodType: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergencyContact: string;
  };

