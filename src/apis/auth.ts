
import axios from "axios";
import {RequestSigninDto, RequestSignupDto, ResponseMyInfoDto, ResponseSigninDto, ResponseSignupDto} from "../types/auth.ts";
import { axiosInstance } from "./axios.ts";

export const postSignup = async (body: RequestSignupDto) : Promise <ResponseSignupDto>=> {

    const {data} = await axiosInstance.post("/v1/auth/signup",body);
    return data;
};

export const postSignin = async (body: RequestSigninDto) : Promise <ResponseSigninDto> => {
    const {data} = await axiosInstance.post("/v1/auth/signin",body);
    return data;
};


export const getMyInfo = async ():Promise<ResponseMyInfoDto> => {
    const {data} = await axiosInstance.get("/v1/users/me", {
    });
    return data;
};

// 아이디 찾기
export type FindIdRequest = { name: string; email: string };
export type FindIdResponse = { username: string };
export async function postFindId(data: FindIdRequest) {
  return (await axios.post<FindIdResponse>('/api/auth/find-id', data)).data;
}

// 비밀번호 재설정 요청
export type PasswordResetRequest = { email: string; name: string };
export async function postPasswordResetRequest(data: PasswordResetRequest) {
  return axios.post('/api/auth/password-reset/request', data);
}
