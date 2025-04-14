import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { type Session } from "next-auth";

// Type for session user
interface DashboardUser {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    metrics?: { [key: string]: number } | null;
}

// Type for saved items fetched from the backend
interface SavedItem {
    itemId: number;
    platform: string;
    url: string;
    savedAt: string; // ISO date string
}

// Function to fetch saved items
async function getSavedItems(userId: string): Promise<SavedItem[]> {
  console.log(`[WTHAI:Dashboard:Fetch] Fetching saved items for user: ${userId}`);
  const apiUrl = `${process.env.BACKEND_API_URL}/user/${userId}/saved`;
  console.log(`[WTHAI:Dashboard:Fetch] API URL: ${apiUrl}`);

  if (!process.env.BACKEND_API_URL) {
    console.error("[WTHAI:Dashboard:Fetch] BACKEND_API_URL is not defined in environment variables.");
    return []; // Return empty array or throw error
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data is fetched on each request
    });

    if (!response.ok) {
      // Handle non-200 responses (like 404 Not Found)
      if (response.status === 404) {
        console.log(`[WTHAI:Dashboard:Fetch] No saved items found (404) for user: ${userId}`);
        return [];
      }
      // Log other errors
      console.error(`[WTHAI:Dashboard:Fetch] Error fetching saved items for user ${userId}: ${response.status} ${response.statusText}`);
      const errorBody = await response.text(); // Read error body for more details
      console.error(`[WTHAI:Dashboard:Fetch] Error body: ${errorBody}`);
      return []; // Or throw an error to show a general error message
    }

    const data = await response.json();
    console.log(`[WTHAI:Dashboard:Fetch] Successfully fetched ${data.items?.length ?? 0} items for user ${userId}`);
    return data.items || []; // Return the items array or an empty array if missing

  } catch (error) {
    console.error(`[WTHAI:Dashboard:Fetch] Network or other error fetching saved items for user ${userId}:`, error);
    return []; // Return empty array on error
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as Session & { user?: DashboardUser } | null;

  if (!session?.user?.id) { // Check for user ID specifically
    console.log("[WTHAI:Dashboard] No session or user ID found, redirecting to /");
    redirect("/");
  }

  const user = session.user;
  console.log("[WTHAI:Dashboard] Rendering dashboard for user:", user.id);

  // Fetch saved items for the user
  const savedItems = await getSavedItems(user.id!);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* User Info Card */}
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
      </Card>

      {/* Saved Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Items</CardTitle>
          <CardDescription>
            Items you have saved from various platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {savedItems.length > 0 ? `A list of your ${savedItems.length} saved items.` : "You haven't saved any items yet."}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Platform</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Saved At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedItems.length > 0 ? (
                savedItems.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>
                      <Badge variant="secondary">{item.platform}</Badge>
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.url}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(item.savedAt), 'PPpp')} {/* Format date nicely */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No items saved yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 