import { parseCookies } from "nookies";
import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

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

export const getServerSideProps = withSSRAuth(async (context) => {
    const apiClient = setupAPIClient(context)
    await apiClient.get('/me');

    return {
        props: {}
    }
})