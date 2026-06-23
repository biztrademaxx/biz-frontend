// app/exhibitors/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Grid3X3,
    List,
    Filter,
    Building2,
    MapPin,
    X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getPublicProfilePath } from "@/lib/profile-path";
import ExhibitorsListingPageSkeleton from "@/components/ExhibitorsListingPageSkeleton";

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
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        loadAllExhibitors();
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedCountry]);

    const countries = useMemo(() => {
        const set = new Set<string>();
        allExhibitors.forEach((ex) => {
            const c = ex.country || ex.location;
            if (c) set.add(c);
        });
        return Array.from(set).sort();
    }, [allExhibitors]);

    const filteredExhibitors = useMemo(() => {
        let filtered = allExhibitors;

        if (debouncedSearch) {
            filtered = filtered.filter((ex) => exhibitorMatchesSearch(ex, debouncedSearch));
        }

        if (selectedCountry) {
            filtered = filtered.filter(
                (ex) => (ex.country || ex.location || "").toLowerCase() === selectedCountry.toLowerCase(),
            );
        }

        return filtered;
    }, [allExhibitors, debouncedSearch, selectedCountry]);

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

    const handleClearFilters = useCallback(() => {
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

    const hasActiveFilters = Boolean(debouncedSearch || selectedCountry);
    const sectionTitle = debouncedSearch ? `Results for "${debouncedSearch}"` : "All Exhibitors";

    // Pagination window: show up to 5 numbers, then ellipsis, then last page
    const pageNumbers = useMemo(() => {
        const nums: (number | "ellipsis")[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) nums.push(i);
            return nums;
        }
        nums.push(1, 2, 3, 4);
        if (safePage > 5) nums.push("ellipsis");
        else if (totalPages > 5) nums.push(5);
        if (totalPages > 5 && !nums.includes(totalPages)) {
            if (nums[nums.length - 1] !== "ellipsis") nums.push("ellipsis");
            nums.push(totalPages);
        }
        return nums;
    }, [totalPages, safePage]);

    if (loading) {
        return <ExhibitorsListingPageSkeleton />;
    }

    return (
        <main className="min-h-screen bg-[#f9f9f9]">
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#042f8c] via-[#0b3ea8] to-[#06378f]">
                <div className="absolute inset-0 bg-[url('/images/exhibitors-bg.jpg')] bg-cover bg-center opacity-15" />
                <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16 sm:pb-16 lg:px-8 lg:pt-20 lg:pb-20">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">Exhibitors</h1>
                    <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
                        Connect with verified companies, explore solutions, and grow your business network.
                    </p>

                    <div className="mt-8 w-full max-w-2xl sm:mt-9">
                        <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-2xl">
                            <Search size={18} className="ml-2 shrink-0 text-gray-400" />
                            <input
                                type="search"
                                enterKeyHint="search"
                                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 sm:text-base"
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
                            <button
                                type="button"
                                onClick={() => {
                                    setDebouncedSearch(searchTerm.trim());
                                    setCurrentPage(1);
                                }}
                                className="shrink-0 rounded-lg bg-[#0B63F6] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ALL EXHIBITORS */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
                <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#111827] sm:text-[26px]">{sectionTitle}</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {filteredExhibitors.length.toLocaleString()} exhibitor
                            {filteredExhibitors.length !== 1 ? "s" : ""}
                            {hasActiveFilters ? " matching your search" : " available"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition sm:h-11 sm:w-11 ${viewMode === "grid"
                                    ? "bg-[#0B63F6] text-white"
                                    : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                            aria-label="Grid view"
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition sm:h-11 sm:w-11 ${viewMode === "list"
                                    ? "bg-[#0B63F6] text-white"
                                    : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                }`}
                            aria-label="List view"
                        >
                            <List size={18} />
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setFiltersOpen((v) => !v)}
                                className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:h-11"
                            >
                                <Filter size={16} />
                                Filters
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {filtersOpen && (
                                <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-4 shadow-xl
                                sm:absolute sm:right-1/2 max-sm:left-auto max-sm:right-1/2 max-sm:translate-x-1/2">
                                    <div className="mb-1">
                                        <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                            Country
                                        </label>
                                        <select
                                            value={selectedCountry}
                                            onChange={(e) => setSelectedCountry(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0B63F6]"
                                        >
                                            <option value="">All Countries</option>
                                            {countries.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={handleClearFilters}
                                            className="mt-3 text-sm font-medium text-[#0B63F6] hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {displayedExhibitors.length === 0 ? (
                    <div className="rounded-2xl bg-white py-16 text-center sm:py-20">
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
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                                    : "flex flex-col gap-3"
                            }
                        >
                            {displayedExhibitors.map((exhibitor) =>
                                viewMode === "grid" ? (
                                    <ExhibitorCard
                                        key={exhibitor.id}
                                        exhibitor={exhibitor}
                                        onClick={() => navigateToProfile(exhibitor)}
                                    />
                                ) : (
                                    <ExhibitorRow
                                        key={exhibitor.id}
                                        exhibitor={exhibitor}
                                        onClick={() => navigateToProfile(exhibitor)}
                                    />
                                ),
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {pageNumbers.map((p, i) =>
                                    p === "ellipsis" ? (
                                        <span
                                            key={`ellipsis-${i}`}
                                            className="flex h-10 w-10 items-center justify-center text-gray-400 sm:h-11 sm:w-11"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setCurrentPage(p)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition sm:h-11 sm:w-11 ${safePage === p
                                                    ? "bg-[#0B63F6] text-white"
                                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ),
                                )}
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                                    aria-label="Next page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

function ExhibitorAvatar({ exhibitor, name }: { exhibitor: Exhibitor; name: string }) {
    const getInitials = () => {
        if (!name) return "E";
        return name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
            {exhibitor.avatar ? (
                <img src={exhibitor.avatar} alt={name} className="h-14 w-14 rounded-xl object-cover" />
            ) : (
                <span className="text-lg font-bold text-blue-600">{getInitials()}</span>
            )}
        </div>
    );
}

function ExhibitorCard({ exhibitor, onClick }: { exhibitor: Exhibitor; onClick: () => void }) {
    const name = getExhibitorDisplayName(exhibitor);
    const location = exhibitor.location || exhibitor.country;

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") onClick();
            }}
            className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
        >
            <div className="mb-4">
                <ExhibitorAvatar exhibitor={exhibitor} name={name} />
            </div>

            <h3 className="line-clamp-1 text-base font-semibold text-[#111827]">{name}</h3>

            {exhibitor.industry && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                    <Building2 size={14} className="shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{exhibitor.industry}</span>
                </p>
            )}

            {location && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">
                    <MapPin size={14} className="shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{location}</span>
                </p>
            )}

            <button
                type="button"
                onClick={onClick}
                className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0B63F6] hover:underline"
            >
                View Profile
                <ChevronRight size={15} />
            </button>
        </div>
    );
}

function ExhibitorRow({ exhibitor, onClick }: { exhibitor: Exhibitor; onClick: () => void }) {
    const name = getExhibitorDisplayName(exhibitor);
    const location = exhibitor.location || exhibitor.country;

    return (
        <div
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") onClick();
            }}
            className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
        >
            <ExhibitorAvatar exhibitor={exhibitor} name={name} />
            <div className="min-w-0 flex-1">
                <h3 className="line-clamp-1 text-base font-semibold text-[#111827]">{name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    {exhibitor.industry && (
                        <span className="flex items-center gap-1.5">
                            <Building2 size={14} className="shrink-0 text-gray-400" />
                            {exhibitor.industry}
                        </span>
                    )}
                    {location && (
                        <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="shrink-0 text-gray-400" />
                            {location}
                        </span>
                    )}
                </div>
            </div>
            <button
                type="button"
                onClick={onClick}
                className="shrink-0 flex items-center gap-1 text-sm font-medium text-[#0B63F6] hover:underline"
            >
                View Profile
                <ChevronRight size={15} />
            </button>
        </div>
    );
}