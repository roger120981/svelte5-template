import { getItemById, getList, getSession } from "./backend.svelte.ts";
import { supabase } from "./backend.svelte.ts";
import type { Database } from "$lib/types/database.types";
import { handleServerFunctionResponse } from "$lib/utils/errorHandling";

export type Org = Database["public"]["Tables"]["orgs"]["Insert"];

//import type { Org } from "$lib/types/org.ts";
//import type { Database } from "$lib/types/database.types";

export const getAllOrgs = async () => {
    return fetchOrgs("title", "asc");
};

export async function fetchOrgs(
    column: string,
    direction: "asc" | "desc",
): Promise<{
    data: Database["public"]["Tables"]["orgs"]["Row"][];
    error: unknown | null;
}> {
    const { data, error } = await getList("orgs", 1, 50, column, direction);
    return { data: data ?? [], error };
}

export const getOrgById = async (
    id: string,
): Promise<{
    data: Database["public"]["Tables"]["orgs"]["Insert"] | null;
    error: unknown | null;
}> => {
    try {
        const { data } = await getItemById("orgs", id);
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

export const getMyRoleInOrg = async (orgId: string) => {
    const { data: sessionData, error: sessionError } = await getSession();
    const { data, error } = await supabase
        .from("orgs_users")
        .select("user_role")
        .eq("orgid", orgId)
        .eq("userid", sessionData?.session?.user?.id)
        .limit(1)
        .single();
    return { data: data?.user_role, error };
};

export const saveOrg = async (org: Org) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "org_upsert",
                payload: {
                    id: org.id === "new" ? null : org.id,
                    title: org.title,
                },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteOrg = async (org: Org) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "org_delete", payload: { id: org.id } },
        },
    );
    return handleServerFunctionResponse(response);
};

export const updateUserRole = async (
    orgs_users_id: string,
    new_user_role: string,
) => {
    if (!orgs_users_id || !new_user_role) {
        return {
            data: null,
            error: "orgs_users_id or new_user_role not provided",
        };
    }
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: {
                action: "org_user_update_role",
                payload: { id: orgs_users_id, user_role: new_user_role },
            },
        },
    );
    return handleServerFunctionResponse(response);
};

export const deleteOrgUser = async (id: string) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "org_user_delete", payload: { id } },
        },
    );
    return handleServerFunctionResponse(response);
};

export const getOrgUsers = async (org: Org) => {
    const response = await supabase.functions.invoke(
        "server_function",
        {
            body: { action: "get_org_users", payload: { id: org.id } },
        },
    );
    return handleServerFunctionResponse(response);
};
