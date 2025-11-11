import { useQuery } from "@tanstack/react-query";
import { getDashboardDataApi, type DashboardData } from "../api/dashboard.api";

export function useDashboard() {
    return useQuery<DashboardData, Error>({
        queryKey: ["dashboard"],
        queryFn: getDashboardDataApi,
    });
}