// app/(admin)/my-performance/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MyPerformance from "../MyPerformance";

export const metadata = {
    title: "My Performance | Dashboard",
    description: "Track your leads, updates, and activity performance",
};

export default async function MyPerformancePage() {
    const session = await getServerSession();

    console.log("========== MY PERFORMANCE PAGE DEBUG ==========");
    console.log("Session exists:", !!session);
    console.log("User:", session?.user);
    console.log("User role:", (session?.user as any)?.role);
    console.log("User permissions:", (session?.user as any)?.permissions);
    console.log("Has my-performance-view:", (session?.user as any)?.permissions?.includes("my-performance-view"));
    console.log("==============================================");

    // Check if user is logged in
    if (!session?.user) {
        console.log("No session, redirecting to login");
        redirect("/login");
    }

    // Check if user has permission to view performance
    const userPermissions = (session.user as any)?.permissions || [];

    if (!userPermissions.includes("my-performance-view")) {
        console.log("User does NOT have my-performance-view permission, redirecting to dashboard");
        redirect("/admin/dashboard");
    }

    console.log("User has permission, showing MyPerformance component");
    return <MyPerformance />;
}