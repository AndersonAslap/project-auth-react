import { parseCookies } from "nookies";
import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { api } from "../services/api";

export default function Dashboard() {

    const { user } = useContext(AuthContext);

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            api.get('/me').then(response => console.log(response))
                .catch(err => console.log(err))
        }

    }, [])

    return (
        <h1>Hello: {user?.email}</h1>
    )
}