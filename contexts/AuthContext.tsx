import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import Router from 'next/router';

import { api } from "../services/apiClient";

type SingInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    singIn: (credentials: SingInCredentials) => Promise<void>;
    singOut: () => void;
    isAuthenticated: boolean;
    user: User;
}

type AuthProviderProps = {
    children: ReactNode
}

type User = {
    email: string;
    permissions: string[];
    roles: string[]
}

export const AuthContext = createContext({} as AuthContextData);

let authChanel: BroadcastChannel;

export function singOut(broadcast: boolean = true) {
    destroyCookie(undefined, 'nextauth.token')
    destroyCookie(undefined, 'nextauth.refreshToken')

    if (broadcast) authChanel.postMessage('singOut')

    Router.push("/")
}

export function AuthProvider({ children }: AuthProviderProps) {

    useEffect(() => {
        authChanel = new BroadcastChannel('auth');

        authChanel.onmessage = (message) => {
            switch (message.data) {
                case 'singOut':
                    singOut(false);
                    break;
                default:
                    break;
            }
        }
    }, [])

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            api.get('/me').then(response => {

                const { email, permissions, roles } = response.data;

                setUser({
                    email,
                    permissions,
                    roles
                });
            }).catch(() => {
                singOut();
            })
        }

    }, [])

    const [user, setUser] = useState<User>();

    const isAuthenticated = !!user;

    async function singIn({ email, password }: SingInCredentials) {

        try {
            const response = await api.post("/sessions", {
                email,
                password
            });

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            });

            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/'
            });

            setUser({
                email,
                permissions,
                roles
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push("/dashboard");


        } catch (err) {
            console.log(err)
        }

    }

    return (
        <AuthContext.Provider value={{ singIn, isAuthenticated, user, singOut }}>
            {children}
        </AuthContext.Provider>
    )
}