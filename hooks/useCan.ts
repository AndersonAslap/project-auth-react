import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { validateUserPermission } from "../utils/validateUserPermissions";

type UseCanProps = {
    permissions?: string[];
    roles?: string[];
}

export function useCan({ permissions, roles }: UseCanProps) {
    const { user, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return false;
    }

    const useHasValidPermissions = validateUserPermission({
        user,
        permissions,
        roles
    });

    return useHasValidPermissions;

}