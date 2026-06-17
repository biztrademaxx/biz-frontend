// app/exhibitors/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    List,
    X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getPublicProfilePath } from "@/lib/profile-path";

interface Exhibitor {
    id: string;
    publicSlug?: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    companyName?: string;
    company?: string;
    email: string;
    avatar?: string;
    bio?: string;
    industry?: string;
    location?: string;
    jobTitle?: string;
    country?: string;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const ITEMS_PER_PAGE = 12;

function parseExhibitorsResponse(response: unknown): Exhibitor[] {
    let raw: unknown[] = [];
    if (Array.isArray(response)) {
        raw = response;
    } else if (response && typeof response === "object") {
        const obj = response as Record<string, unknown>;
        if (Array.isArray(obj.exhibitors)) raw = obj.exhibitors;
        else if (Array.isArray(obj.data)) raw = obj.data;
    }
    return raw.map((item) => normalizeExhibitor(item as Record<string, unknown>)).filter((e) => e.id);
}

function normalizeExhibitor(raw: Record<string, unknown>): Exhibitor {
    const company = (raw.company as string) || (raw.companyName as string) || "";
    return {
        id: String(raw.id ?? ""),
        publicSlug: raw.publicSlug as string | undefined,
        firstName: raw.firstName as string | undefined,
        lastName: raw.lastName as string | undefined,
        organizationName: raw.organizationName as string | undefined,
        companyName: company || undefined,
        company: company || undefined,
        email: String(raw.email ?? ""),
        avatar: raw.avatar as string | undefined,
        bio: raw.bio as string | undefined,
        industry: (raw.industry as string) || (raw.companyIndustry as string) || undefined,
        location: raw.location as string | undefined,
        jobTitle: raw.jobTitle as string | undefined,
        country: (raw.country as string) || (raw.location as string) || undefined,
        isVerified: Boolean(raw.isVerified),
        createdAt: raw.createdAt as string | undefined,
        updatedAt: raw.updatedAt as string | undefined,
    };
}

function exhibitorMatchesSearch(exhibitor: Exhibitor, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const fullName = `${exhibitor.firstName ?? ""} ${exhibitor.lastName ?? ""}`.trim().toLowerCase();
    const fields = [
        exhibitor.companyName,
        exhibitor.company,
        exhibitor.organizationName,
        exhibitor.firstName,
        exhibitor.lastName,
        fullName,
        exhibitor.industry,
        exhibitor.bio,
        exhibitor.email,
        exhibitor.location,
        exhibitor.country,
        exhibitor.jobTitle,
    ]
        .filter((v): v is string => Boolean(v?.trim()))
        .map((v) => v.toLowerCase());

    const haystack = fields.join(" ");
    if (haystack.includes(q)) return true;

    const words = q.split(/\s+/).filter(Boolean);
    return words.every((word) => fields.some((field) => field.includes(word)));
}

function getExhibitorDisplayName(exhibitor: Exhibitor): string {
    return (
        exhibitor.companyName ||
        exhibitor.company ||
        exhibitor.organizationName ||
        `${exhibitor.firstName || ""} ${exhibitor.lastName || ""}`.trim() ||
        "Exhibitor"
    );
}

export default function ExhibitorsPage() {
    const router = useRouter();
    const [allExhibitors, setAllExhibitors] = useState<Exhibitor[]>([]);
    const [featuredExhibitors, setFeaturedExhibitors] = useState<Exhibitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadAllExhibitors();
        fetchFeaturedExhibitors();
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedIndustry, selectedCountry]);

    const filteredExhibitors = useMemo(() => {
        let filtered = allExhibitors;

        if (debouncedSearch) {
            filtered = filtered.filter((ex) => exhibitorMatchesSearch(ex, debouncedSearch));
        }

        if (selectedIndustry) {
            filtered = filtered.filter(
                (ex) => (ex.industry || "").toLowerCase() === selectedIndustry.toLowerCase(),
            );
        }

        if (selectedCountry) {
            filtered = filtered.filter(
                (ex) => (ex.country || ex.location || "").toLowerCase() === selectedCountry.toLowerCase(),
            );
        }

        return filtered;
    }, [allExhibitors, debouncedSearch, selectedIndustry, selectedCountry]);

    const totalPages = Math.max(1, Math.ceil(filteredExhibitors.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);

    const displayedExhibitors = useMemo(() => {
        const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
        return filteredExhibitors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredExhibitors, safePage]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const loadAllExhibitors = async () => {
        setLoading(true);
        try {
            const response = await apiFetch<unknown>("/api/exhibitors?limit=1000", { auth: false });
            const exhibitorsData = parseExhibitorsResponse(response);
            setAllExhibitors(exhibitorsData);
        } catch (error) {
            console.error("Failed to load exhibitors:", error);
            setAllExhibitors([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeaturedExhibitors = async () => {
        try {
            let featuredData: Exhibitor[] = [];
            try {
                const response = await apiFetch<unknown>("/api/exhibitors?featured=true&limit=4", { auth: false });
                featuredData = parseExhibitorsResponse(response).slice(0, 4);
            } catch {
                const response = await apiFetch<unknown>("/api/exhibitors?limit=4", { auth: false });
                featuredData = parseExhibitorsResponse(response).slice(0, 4);
            }
            setFeaturedExhibitors(featuredData);
        } catch (error) {
            console.error("Failed to fetch featured exhibitors:", error);
            setFeaturedExhibitors([]);
        }
    };

    const handleClearFilters = useCallback(() => {
        setSelectedIndustry("");
        setSelectedCountry("");
        setSearchTerm("");
        setDebouncedSearch("");
        setCurrentPage(1);
    }, []);

    const navigateToProfile = (exhibitor: Exhibitor) => {
        const path = getPublicProfilePath("exhibitor", {
            id: exhibitor.id,
            publicSlug: exhibitor.publicSlug,
            organizationName: exhibitor.organizationName,
            company: exhibitor.companyName || exhibitor.company,
            firstName: exhibitor.firstName,
            lastName: exhibitor.lastName,
        });
        router.push(path);
    };

    const hasActiveFilters = Boolean(debouncedSearch || selectedIndustry || selectedCountry);
    const sectionTitle = debouncedSearch
        ? `Results for "${debouncedSearch}"`
        : "All Exhibitors";

    return (
        <main className="min-h-screen bg-[#f6f8fb]">
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#042f8c] via-[#0b3ea8] to-[#06378f]">
                <div className="absolute inset-0 bg-[url('/images/exhibitors-bg.jpg')] bg-cover bg-center opacity-15" />
                <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20 lg:px-8 lg:pt-16 lg:pb-28">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-[52px]">
                            Discover Leading
                            <span className="block sm:inline sm:ml-2">Exhibitors Worldwide</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/90 sm:mt-5 sm:text-base md:text-lg">
                            Connect with top companies, explore innovative solutions, and grow your network.
                        </p>

                        <div className="mx-auto mt-8 w-full max-w-3xl sm:mt-10">
                            <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-2xl sm:flex-row sm:items-stretch sm:gap-0 sm:p-0">
                                <div className="flex min-h-12 flex-1 items-center gap-2 px-3 sm:px-4">
                                    <Search size={20} className="shrink-0 text-gray-400" />
                                    <input
                                        type="search"
                                        enterKeyHint="search"
                                        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:text-base"
                                        placeholder="Search companies, people, industry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                setDebouncedSearch(searchTerm.trim());
                                                setCurrentPage(1);
                                            }
                                        }}
                                        aria-label="Search exhibitors"
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setDebouncedSearch("");
                                            }}
                                            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                            aria-label="Clear search"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDebouncedSearch(searchTerm.trim());
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg bg-[#0B63F6] px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:m-2 sm:px-8 sm:py-0"
                                >
                                    Search
                                </button>
                            </div>
                            {debouncedSearch && (
                                <p className="mt-3 text-sm text-white/80">
                                    {filteredExhibitors.length} exhibitor{filteredExhibitors.length !== 1 ? "s" : ""} found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED */}
            {featuredExhibitors.length > 0 && !debouncedSearch && (
                <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
                    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">Featured Exhibitors</h2>
                        <div className="hidden gap-3 sm:flex">
                            <button
                                type="button"
                                className="flex h-11 w-11 items-center justify-center rounded-full border bg-white hover:bg-gray-50"
                                aria-label="Previous featured"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                className="flex h-11 w-11 items-center justify-center rounded-full border bg-white hover:bg-gray-50"
                                aria-label="Next featured"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {featuredExhibitors.map((exhibitor) => (
                            <FeaturedCard
                                key={exhibitor.id}
                                exhibitor={exhibitor}
                                onClick={() => navigateToProfile(exhibitor)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* ALL EXHIBITORS */}
            <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
                <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#111827] sm:text-3xl">{sectionTitle}</h2>
                        {!loading && (
                            <p className="mt-1 text-sm text-gray-500 sm:text-base">
                                {filteredExhibitors.length} exhibitor{filteredExhibitors.length !== 1 ? "s" : ""}
                                {hasActiveFilters ? " matching your search" : " available"}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B63F6] text-white sm:h-11 sm:w-11"
                            aria-label="Grid view"
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white sm:h-11 sm:w-11"
                            aria-label="List view"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16 sm:py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0B63F6] sm:h-12 sm:w-12" />
                    </div>
                ) : displayedExhibitors.length === 0 ? (
                    <div className="py-16 text-center sm:py-20">
                        <div className="mb-4 text-5xl sm:text-6xl">🔍</div>
                        <p className="text-base text-gray-500 sm:text-lg">No exhibitors found</p>
                        {debouncedSearch && (
                            <p className="mt-2 text-sm text-gray-400 sm:text-base">
                                No results for &ldquo;{debouncedSearch}&rdquo;. Try another name or keyword.
                            </p>
                        )}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="mt-4 font-medium text-[#0B63F6] hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                            {displayedExhibitors.map((exhibitor) => (
                                <ExhibitorCard
                                    key={exhibitor.id}
                                    exhibitor={exhibitor}
                                    onClick={() => navigateToProfile(exhibitor)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && safePage > 3) {
                                        pageNum = safePage - 2 + i;
                                        if (pageNum > totalPages) return null;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition sm:h-11 sm:w-11 ${
                                                safePage === pageNum
                                                    ? "bg-[#0B63F6] text-white"
                                                    : "border bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* RECOMMENDED */}
            {featuredExhibitors.length > 0 && !debouncedSearch && (
                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
                    <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-2xl font-bold sm:text-3xl">You May Also Like</h2>
                        <button type="button" className="self-start text-sm text-[#0B63F6] hover:underline sm:text-base">
                            View All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                        {featuredExhibitors.slice(0, 4).map((exhibitor) => (
                            <FeaturedCard
                                key={`rec-${exhibitor.id}`}
                                exhibitor={exhibitor}
                                onClick={() => navigateToProfile(exhibitor)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}

function FeaturedCard({ exhibitor, onClick }: { exhibitor: Exhibitor; onClick: () => void }) {
    const name = getExhibitorDisplayName(exhibitor);
    const getInitials = () => {
        if (!name) return "E";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div
            onClick={onClick}
            className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
        >
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 sm:h-16 sm:w-16">
                    {exhibitor.avatar ? (
                        <img src={exhibitor.avatar} alt={name} className="h-10 w-10 rounded-xl object-cover sm:h-12 sm:w-12" />
                    ) : (
                        <span className="text-lg font-bold text-blue-600 sm:text-xl">{getInitials()}</span>
                    )}
                </div>
                {exhibitor.isVerified && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs text-green-700">
                        Verified
                    </span>
                )}
            </div>
            <h3 className="line-clamp-2 text-base font-semibold sm:text-lg">{name}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                {exhibitor.industry || exhibitor.location || "Various Industries"}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm sm:mt-5">
                <span className="flex items-center gap-1 text-gray-600">
                    <Calendar size={14} />
                    0 Events
                </span>
            </div>
            <button
                type="button"
                className="mt-4 w-full rounded-xl border py-2.5 text-sm font-medium transition hover:bg-gray-50 sm:mt-5 sm:py-3"
            >
                View Profile
            </button>
        </div>
    );
}

function ExhibitorCard({ exhibitor, onClick }: { exhibitor: Exhibitor; onClick: () => void }) {
    const name = getExhibitorDisplayName(exhibitor);
    const getInitials = () => {
        if (!name) return "E";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div
            onClick={onClick}
            className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
        >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 sm:mb-4 sm:h-14 sm:w-14">
                {exhibitor.avatar ? (
                    <img src={exhibitor.avatar} alt={name} className="h-9 w-9 rounded-lg object-cover sm:h-10 sm:w-10" />
                ) : (
                    <span className="text-base font-bold text-blue-600 sm:text-lg">{getInitials()}</span>
                )}
            </div>
            <h3 className="line-clamp-2 font-semibold leading-snug">{name}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                {exhibitor.industry || exhibitor.location || "Various Industries"}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600 sm:mt-4">
                <span>0 Events</span>
            </div>
            <button type="button" className="mt-3 text-sm font-medium text-[#0B63F6] hover:underline sm:mt-4">
                View Profile →
            </button>
        </div>
    );
}