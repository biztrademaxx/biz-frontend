// app/exhibitors/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ChevronDown,
    Star,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    List,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { getPublicProfilePath } from "@/lib/profile-path";

interface Exhibitor {
    country: string;
    id: string;
    publicSlug?: string;
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    companyName?: string;
    email: string;
    avatar?: string;
    bio?: string;
    industry?: string;
    isVerified: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function ExhibitorsPage() {
    const router = useRouter();
    const [allExhibitors, setAllExhibitors] = useState<Exhibitor[]>([]);
    const [displayedExhibitors, setDisplayedExhibitors] = useState<Exhibitor[]>([]);
    const [featuredExhibitors, setFeaturedExhibitors] = useState<Exhibitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIndustry, setSelectedIndustry] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [totalExhibitors, setTotalExhibitors] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    const industries = ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education", "Energy"];
    const countries = ["USA", "UK", "Canada", "Germany", "France", "Japan", "India"];

    // Load all exhibitors on mount
    useEffect(() => {
        loadAllExhibitors();
        fetchFeaturedExhibitors();
    }, []);

    // Apply filters whenever search term or filters change
    useEffect(() => {
        if (allExhibitors.length > 0) {
            applyFiltersAndPagination();
        }
    }, [allExhibitors, searchTerm, selectedIndustry, selectedCountry, currentPage]);

    const loadAllExhibitors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", "1000");

            const url = `/api/exhibitors?${params.toString()}`;

            console.log("📡 Loading all exhibitors from:", url);

            const response = await apiFetch<any>(url, { auth: false });

            console.log("📦 API Response received");

            let exhibitorsData = [];

            if (Array.isArray(response)) {
                exhibitorsData = response;
            } else if (response?.exhibitors && Array.isArray(response.exhibitors)) {
                exhibitorsData = response.exhibitors;
            } else if (response?.data && Array.isArray(response.data)) {
                exhibitorsData = response.data;
            } else if (response?.success && response?.exhibitors) {
                exhibitorsData = response.exhibitors;
            } else {
                console.warn("⚠️ Unexpected response structure:", response);
                exhibitorsData = [];
            }

            console.log(`✅ Loaded ${exhibitorsData.length} total exhibitors`);

            setAllExhibitors(exhibitorsData);
            applyFiltersAndPagination(exhibitorsData);

        } catch (error) {
            console.error("❌ Failed to load exhibitors:", error);
            setAllExhibitors([]);
            setDisplayedExhibitors([]);
            setTotalExhibitors(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndPagination = (exhibitorsList = allExhibitors) => {
        let filtered = [...exhibitorsList];

        if (searchTerm && searchTerm.trim() !== "") {
            const searchLower = searchTerm.toLowerCase().trim();
            console.log(`🔍 Searching for exact matches of: "${searchLower}"`);

            filtered = filtered.filter(exhibitor => {
                const companyName = (exhibitor.companyName || "").toLowerCase();
                const orgName = (exhibitor.organizationName || "").toLowerCase();
                const firstName = (exhibitor.firstName || "").toLowerCase();
                const lastName = (exhibitor.lastName || "").toLowerCase();
                const industry = (exhibitor.industry || "").toLowerCase();
                const bio = (exhibitor.bio || "").toLowerCase();
                const email = (exhibitor.email || "").toLowerCase();

                return companyName.includes(searchLower) ||
                    orgName.includes(searchLower) ||
                    firstName.includes(searchLower) ||
                    lastName.includes(searchLower) ||
                    industry.includes(searchLower) ||
                    bio.includes(searchLower) ||
                    email.includes(searchLower);
            });

            console.log(`✅ Found ${filtered.length} matches for "${searchTerm}"`);
        }

        if (selectedIndustry) {
            filtered = filtered.filter(ex =>
                (ex.industry || "").toLowerCase() === selectedIndustry.toLowerCase()
            );
        }

        if (selectedCountry) {
            filtered = filtered.filter(ex =>
                (ex.country || "").toLowerCase() === selectedCountry.toLowerCase()
            );
        }

        setTotalExhibitors(filtered.length);

        const itemsPerPage = 10;
        const totalPagesCount = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
        setTotalPages(totalPagesCount);

        if (currentPage > totalPagesCount) {
            setCurrentPage(totalPagesCount);
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedResults = filtered.slice(startIndex, endIndex);

        setDisplayedExhibitors(paginatedResults);
        setIsSearching(false);
    };

    const fetchFeaturedExhibitors = async () => {
        try {
            let featuredData = [];

            try {
                const response = await apiFetch<any>("/api/exhibitors?featured=true&limit=4", { auth: false });

                if (Array.isArray(response)) {
                    featuredData = response;
                } else if (response?.exhibitors && Array.isArray(response.exhibitors)) {
                    featuredData = response.exhibitors;
                } else if (response?.data && Array.isArray(response.data)) {
                    featuredData = response.data;
                }
            } catch (err) {
                console.log("Featured endpoint with param failed, trying without...");
                const response = await apiFetch<any>("/api/exhibitors?limit=4", { auth: false });

                if (Array.isArray(response)) {
                    featuredData = response.slice(0, 4);
                } else if (response?.exhibitors && Array.isArray(response.exhibitors)) {
                    featuredData = response.exhibitors.slice(0, 4);
                } else if (response?.data && Array.isArray(response.data)) {
                    featuredData = response.data.slice(0, 4);
                }
            }

            console.log("⭐ Featured exhibitors:", featuredData.length);
            setFeaturedExhibitors(featuredData);

        } catch (error) {
            console.error("Failed to fetch featured exhibitors:", error);
            setFeaturedExhibitors([]);
        }
    };

    const handleSearch = () => {
        setIsSearching(true);
        setCurrentPage(1);
        console.log("🔍 Searching for:", searchTerm);
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        setOpenDropdown(null);
    };

    const handleClearFilters = () => {
        setSelectedIndustry("");
        setSelectedCountry("");
        setSearchTerm("");
        setCurrentPage(1);
        setOpenDropdown(null);
        setIsSearching(false);
    };

    const getExhibitorName = (exhibitor: Exhibitor): string => {
        return exhibitor.companyName ||
            exhibitor.organizationName ||
            `${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim() ||
            "Exhibitor";
    };

    const navigateToProfile = (exhibitor: Exhibitor) => {
        const path = getPublicProfilePath("exhibitor", {
            id: exhibitor.id,
            publicSlug: exhibitor.publicSlug,
            organizationName: exhibitor.organizationName,
            company: exhibitor.companyName,
            firstName: exhibitor.firstName,
            lastName: exhibitor.lastName,
        });
        router.push(path);
    };

    return (
        <main className="min-h-screen bg-[#f6f8fb]">
            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-r from-[#042f8c] via-[#0b3ea8] to-[#06378f]">
                <div className="absolute inset-0 bg-[url('/images/exhibitors-bg.jpg')] bg-cover bg-center opacity-15" />
                <div className="relative mx-auto w-[1440px] px-10 pt-16 pb-28">
                    <div className="text-center">
                        <h1 className="text-white text-[52px] font-bold leading-tight">
                            Discover Leading
                            <br />
                            Exhibitors Worldwide
                        </h1>
                        <p className="mt-5 text-white/90 text-lg">
                            Connect with top companies, explore innovative solutions,
                            and grow your network.
                        </p>

                        {/* SEARCH BAR */}
                        <div className="flex justify-center mt-10">
                            <div className="flex h-[70px] w-[980px] overflow-hidden rounded-xl bg-white shadow-2xl">
                                <div className="flex items-center px-6 text-gray-400">
                                    <Search size={22} />
                                </div>
                                <input
                                    className="flex-1 outline-none text-gray-700"
                                    placeholder="Search exhibitors, companies, products..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsSearching(true);
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="m-2 rounded-lg bg-[#0B63F6] px-10 font-medium text-white hover:bg-blue-700 transition"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="mx-auto mt-14 grid w-[1000px] grid-cols-4">

                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED SECTION - Hide when searching */}
            {featuredExhibitors.length > 0 && !searchTerm && (
                <section className="mx-auto w-[1440px] px-10 pt-14">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-[34px] font-bold text-[#111827]">Featured Exhibitors</h2>
                        <div className="flex gap-3">
                            <button className="flex h-11 w-11 items-center justify-center rounded-full border bg-white hover:bg-gray-50">
                                <ChevronLeft size={18} />
                            </button>
                            <button className="flex h-11 w-11 items-center justify-center rounded-full border bg-white hover:bg-gray-50">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
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
            <section className="mx-auto w-[1440px] px-10 pt-16">
                <div className="mb-8 flex items-center justify-between">
                    {/* COMMENTED OUT: Search Results for "pad" text */}
                    {/* <h2 className="text-[34px] font-bold">
            {searchTerm ? `Search Results for "${searchTerm}"` : "All Exhibitors"}
          </h2> */}
                    <h2 className="text-[34px] font-bold">
                        All Exhibitors
                    </h2>
                    <div className="flex gap-2">
                        <button className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B63F6] text-white">
                            <Grid3X3 size={18} />
                        </button>
                        <button className="flex h-11 w-11 items-center justify-center rounded-lg border bg-white">
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B63F6]"></div>
                    </div>
                ) : displayedExhibitors.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-500 text-lg">No exhibitors found</p>
                        {searchTerm && (
                            <p className="text-gray-400 mt-2">
                                No results found for "{searchTerm}". Try a different search term.
                            </p>
                        )}
                        <button onClick={handleClearFilters} className="mt-4 text-[#0B63F6] hover:underline font-medium">
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-5 gap-6">
                            {displayedExhibitors.map((exhibitor) => (
                                <ExhibitorCard
                                    key={exhibitor.id}
                                    exhibitor={exhibitor}
                                    onClick={() => navigateToProfile(exhibitor)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-3">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-11 w-11 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft size={18} className="mx-auto" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                        if (pageNum > totalPages) return null;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`h-11 w-11 rounded-lg transition ${currentPage === pageNum
                                                    ? "bg-[#0B63F6] text-white"
                                                    : "border bg-white hover:bg-gray-50"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-11 w-11 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronRight size={18} className="mx-auto" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* RECOMMENDED SECTION - Hide when searching */}
            {featuredExhibitors.length > 0 && !searchTerm && (
                <section className="mx-auto w-[1440px] px-10 py-20">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-[34px] font-bold">You May Also Like</h2>
                        <button className="text-[#0B63F6] hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        {featuredExhibitors.slice(0, 4).map((exhibitor) => (
                            <FeaturedCard
                                key={exhibitor.id}
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

function FilterSelect({
    title,
    value,
    displayValue,
    options,
    isOpen,
    onToggle,
    onSelect
}: {
    title: string;
    value: string;
    displayValue: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
}) {
    return (
        <div className="relative">
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {title}
            </label>
            <button
                onClick={onToggle}
                className="flex h-12 w-full items-center justify-between rounded-xl border px-4 bg-white hover:bg-gray-50"
            >
                <span className={`text-sm ${value ? "text-gray-900" : "text-gray-500"}`}>
                    {displayValue}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <div className="absolute z-30 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-60 overflow-auto">
                    <button
                        onClick={() => {
                            onSelect("");
                            onToggle();
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                        All
                    </button>
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onSelect(option);
                                onToggle();
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function FeaturedCard({ exhibitor, onClick }: { exhibitor: Exhibitor; onClick: () => void }) {
    const getInitials = () => {
        const name = exhibitor.companyName || exhibitor.organizationName ||
            `${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim();
        if (!name) return "E";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const getName = () => {
        return exhibitor.companyName || exhibitor.organizationName ||
            `${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim() ||
            "Exhibitor";
    };

    return (
        <div
            onClick={onClick}
            className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer"
        >
            <div className="mb-5 flex items-center justify-between">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    {exhibitor.avatar ? (
                        <img src={exhibitor.avatar} alt={getName()} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                        <span className="text-xl font-bold text-blue-600">{getInitials()}</span>
                    )}
                </div>
                {exhibitor.isVerified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                        Verified
                    </span>
                )}
            </div>
            <h3 className="font-semibold text-lg">{getName()}</h3>
            <p className="mt-2 text-sm text-gray-500">{exhibitor.industry || "Various Industries"}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    0 Events
                </span>
            </div>
            <button className="mt-5 w-full rounded-xl border py-3 font-medium hover:bg-gray-50 transition">
                View Profile
            </button>
        </div>
    );
}

function ExhibitorCard({ exhibitor, onClick }: { exhibitor: Exhibitor; onClick: () => void }) {
    const getInitials = () => {
        const name = exhibitor.companyName || exhibitor.organizationName ||
            `${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim();
        if (!name) return "E";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const getName = () => {
        return exhibitor.companyName || exhibitor.organizationName ||
            `${exhibitor.firstName || ''} ${exhibitor.lastName || ''}`.trim() ||
            "Exhibitor";
    };

    return (
        <div
            onClick={onClick}
            className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer"
        >
            <div className="mb-4 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                {exhibitor.avatar ? (
                    <img src={exhibitor.avatar} alt={getName()} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                    <span className="text-lg font-bold text-blue-600">{getInitials()}</span>
                )}
            </div>
            <h3 className="font-semibold">{getName()}</h3>
            <p className="mt-2 text-sm text-gray-500">{exhibitor.industry || "Various Industries"}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
                <span>0 Events</span>
            </div>
            <button className="mt-4 text-sm font-medium text-[#0B63F6] hover:underline">
                View Profile →
            </button>
        </div>
    );
}