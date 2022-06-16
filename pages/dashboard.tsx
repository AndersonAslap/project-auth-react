import { parseCookies } from "nookies";
import { useContext, useEffect } from "react"
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {

    const { user, singOut } = useContext(AuthContext);

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            api.get('/me').then(response => console.log(response))
                .catch(err => console.log(err))
        }

    }, [])

    return (
        <>
            <h1>Hello: {user?.email}</h1>
            <button onClick={singOut}>Sing out</button>
            <Can permissions={['metrics.list']}>Metrics</Can>

        </>
    )
}

export const getServerSideProps = withSSRAuth(async (context) => {
    const apiClient = setupAPIClient(context)
    await apiClient.get('/me');

    return {
        props: {}
    }
}, {})