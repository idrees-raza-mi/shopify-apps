import { auth, signOut } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/admin/login" });
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const storeDomain =
    process.env.SHOPIFY_STORE_DOMAIN ?? "not-configured.myshopify.com";

  return (
    <div className="min-h-screen flex bg-cream text-[#1a1a1a]">
      <Sidebar
        email={email}
        storeDomain={storeDomain}
        signOutAction={signOutAction}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
