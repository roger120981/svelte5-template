import { getItemById, getList, getSession } from "./backend.svelte.ts";
import { supabase } from "./backend.svelte.ts";
import type { Database } from "$lib/types/database.types";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";

export type Org = Database["public"]["Tables"]["orgs"]["Row"];

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
    data: Database["public"]["Tables"]["orgs"]["Row"] | null;
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
    try {
        if (!org.id || org.id === "new") {
            const { data, error } = await supabase.functions.invoke(
                "org_create",
                {
                    body: { title: org.title },
                },
            );
            let errorMessage = "";
            if (!error) {
                return { data, error: null };
            } else {
                if (error instanceof FunctionsHttpError) {
                    errorMessage = await error.context.json();
                } else if (error instanceof FunctionsRelayError) {
                    errorMessage = error.message;
                } else if (error instanceof FunctionsFetchError) {
                    errorMessage = error.message;
                }
                error.message = errorMessage;
                return { data, error };
            }
        } else {
            const { data, error } = await supabase.functions.invoke(
                "org_update",
                {
                    body: { id: org.id, title: org.title },
                },
            );
            let errorMessage = "";
            if (!error) {
                return { data, error: null };
            } else {
                if (error instanceof FunctionsHttpError) {
                    errorMessage = await error.context.json();
                } else if (error instanceof FunctionsRelayError) {
                    errorMessage = error.message;
                } else if (error instanceof FunctionsFetchError) {
                    errorMessage = error.message;
                }
                error.message = errorMessage;
                return { data, error };
            }
        }
    } catch (e) {
        const error = e as Error;
        console.error("saveOrg unknown error", e);
        if (error) error.message = "unknown error";
        return { data: null, error };
    }
};

export const deleteOrg = async (org: Org) => {
    try {
        const { data, error } = await supabase.functions.invoke(
            "org_delete",
            {
                body: { id: org.id },
            },
        );
        let errorMessage = "";
        if (!error) {
            return { data, error: null };
        } else {
            if (error instanceof FunctionsHttpError) {
                errorMessage = await error.context.json();
            } else if (error instanceof FunctionsRelayError) {
                errorMessage = error.message;
            } else if (error instanceof FunctionsFetchError) {
                errorMessage = error.message;
            }
            error.message = errorMessage;
            return { data, error };
        }
    } catch (e) {
        const error = e as Error;
        console.error("deleteOrg unknown error", e);
        if (error) error.message = "unknown error";
        return { data: null, error };
    }
};
export const getOrgUsers = async (org: Org) => {
    try {
        console.log(
            "getOrgUsers calling edge function org_users with id:",
            org.id,
        );
        const { data, error } = await supabase.functions.invoke(
            "org_users",
            {
                body: { id: org.id },
            },
        );
        console.log("edge function got data", data);
        console.log("edge function got error", error);
        let errorMessage = "";
        if (!error) {
            return { data, error: null };
        } else {
            if (error instanceof FunctionsHttpError) {
                errorMessage = await error.context.json();
            } else if (error instanceof FunctionsRelayError) {
                errorMessage = error.message;
            } else if (error instanceof FunctionsFetchError) {
                errorMessage = error.message;
            }
            error.message = errorMessage;
            return { data, error };
        }
    } catch (e) {
        const error = e as Error;
        console.error("deleteOrg unknown error", e);
        if (error) error.message = "unknown error";
        return { data: null, error };
    }
};