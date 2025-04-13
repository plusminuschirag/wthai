import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust the import path if necessary
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Session } from "next-auth"; // Import Session type if needed elsewhere, directly using authOptions return type is safer

// Define a type for the session user based on your ExtendedSession interface
// This helps with type safety when accessing user properties
interface DashboardUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    metrics?: { [key: string]: number } | null;
}

export default async function DashboardPage() {
  // Fetch session data on the server
  // The type assertion ensures we get the extended session type
  const session = await getServerSession(authOptions) as Session & { user?: DashboardUser } | null;

  // If no session exists, redirect to home or login page
  if (!session?.user) {
    console.log("[WTHAI:Dashboard] No session found, redirecting to /");
    redirect("/"); // Or redirect('/api/auth/signin')
  }

  // Extract user data for easier access
  const user = session.user;

  console.log("[WTHAI:Dashboard] Rendering dashboard for user:", user.id);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User Avatar"} />
              <AvatarFallback>
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name ?? "User"}</CardTitle>
              <CardDescription>{user.email ?? "No email provided"}</CardDescription>
              <CardDescription>User ID: {user.id ?? "N/A"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">User Metrics</h2>
          {user.metrics ? (
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              {JSON.stringify(user.metrics, null, 2)}
            </pre>
          ) : (
            <p>No metrics data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 