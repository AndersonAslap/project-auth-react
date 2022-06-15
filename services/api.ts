import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from 'nookies';
import { resolve } from "path/posix";
import { singOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupAPIClient(context = undefined) {
    let cookies = parseCookies(context);

    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });

    api.interceptors.response.use(response => {
        return response;
    }, (error: AxiosError) => {

        if (error.response.status === 401) {
            if (error.response.data?.code === 'token.expired') {
                // renovar token

                cookies = parseCookies(context);

                const { 'nextauth.refreshToken': refreshToken } = cookies;

                const originalConfig = error.config;

                if (!isRefreshing) {
                    isRefreshing = true;

                    api.post("/refresh", {
                        refreshToken,
                    }).then(response => {
                        const { token, res } = response.data;

                        setCookie(context, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/'
                        });

                        setCookie(context, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30,
                            path: '/'
                        });

                        api.defaults.headers['Authorization'] = `Bearer ${token}`

                        failedRequestsQueue.forEach(request => request.onSuccess(token));
                        failedRequestsQueue = [];

                    }).catch(err => {
                        failedRequestsQueue.forEach(request => request.onFailure(err));
                        failedRequestsQueue = [];

                        if (process.browser) {
                            singOut()
                        }

                    }).finally(() => {
                        isRefreshing = false
                    });

                }

                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`
                            resolve(api(originalConfig))
                        },
                        onFailure: (err: AxiosError) => {
                            reject(err)
                        }
                    })
                });


            } else {
                if (process.browser) {
                    singOut()
                } else {
                    return Promise.reject(new AuthTokenError())
                }
            }
        }

        return Promise.reject(error);
    });

    return api;
}