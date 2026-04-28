type PublicRole = "organizer" | "speaker" | "exhibitor" | "user";

type ProfilePathInput = {
  id?: string | null;
  publicSlug?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  organizationName?: string | null;
  company?: string | null;
};

export function slugifyPublicProfile(value: string | null | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function deriveSlug(role: PublicRole, data: ProfilePathInput): string {
  if (role === "organizer") {
    return (
      slugifyPublicProfile(data.organizationName) ||
      slugifyPublicProfile(data.company) ||
      slugifyPublicProfile(data.firstName)
    );
  }
  if (role === "exhibitor") {
    return slugifyPublicProfile(data.organizationName) || slugifyPublicProfile(data.company) || slugifyPublicProfile(data.firstName);
  }
  return slugifyPublicProfile(`${data.firstName ?? ""} ${data.lastName ?? ""}`);
}

export function getPublicProfilePath(role: PublicRole, data: ProfilePathInput): string {
  const segment =
    data.publicSlug?.trim() || deriveSlug(role, data) || data.id?.trim() || "profile";
  return `/${role}/${segment}`;
}
