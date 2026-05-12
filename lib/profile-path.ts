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
    const full = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
    return (
      slugifyPublicProfile(data.organizationName) ||
      slugifyPublicProfile(data.company) ||
      slugifyPublicProfile(full) ||
      slugifyPublicProfile(data.firstName)
    );
  }
  return slugifyPublicProfile(`${data.firstName ?? ""} ${data.lastName ?? ""}`);
}

export function getPublicProfilePath(role: PublicRole, data: ProfilePathInput): string {
  const segment =
    data.publicSlug?.trim() || deriveSlug(role, data) || data.id?.trim() || "profile";
  return `/${role}/${segment}`;
}

/** Logged-in speaker dashboard URL: same slug segment as public `/speaker/{slug}` when possible. */
export function getSpeakerDashboardPath(userId: string, data: ProfilePathInput): string {
  const segment = data.publicSlug?.trim() || deriveSlug("speaker", data);
  if (segment) {
    return `/speaker-dashboard/${encodeURIComponent(segment)}`;
  }
  return `/speaker-dashboard/${userId}`;
}

/** Logged-in organizer dashboard URL: same slug segment as public `/organizer/{slug}` when possible. */
export function getOrganizerDashboardPath(userId: string, data: ProfilePathInput): string {
  const segment = data.publicSlug?.trim() || deriveSlug("organizer", data);
  if (segment) {
    return `/organizer-dashboard/${encodeURIComponent(segment)}`;
  }
  return `/organizer-dashboard/${userId}`;
}

/** Logged-in exhibitor dashboard URL: company / org slug, else full name, else UUID. */
export function getExhibitorDashboardPath(userId: string, data: ProfilePathInput): string {
  const segment = data.publicSlug?.trim() || deriveSlug("exhibitor", data);
  if (segment) {
    return `/exhibitor-dashboard/${encodeURIComponent(segment)}`;
  }
  return `/exhibitor-dashboard/${userId}`;
}
