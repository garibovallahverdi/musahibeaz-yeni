"use client"
import { api } from "~/trpc/react";

export function useUser() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data: session, isLoading, isError } = api.user.useQuery()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { session, isLoading, isError }
}