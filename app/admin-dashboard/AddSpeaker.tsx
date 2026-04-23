"use client";

import Image from "next/image";
import { Facebook, Linkedin, Twitter, Instagram, Upload, X } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCityOptions, getCountryOptions, getStateOptions } from "@/lib/location-data";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  company: "",
  jobTitle: "",
  location: "",
  country: "",
  state: "",
  city: "",
  website: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  facebook: "",
  speakingExperience: "",
};

export default function AddSpeaker() {
  const LOCATION_NONE = "__none__";
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [countryPick, setCountryPick] = useState<string>(LOCATION_NONE);
  const [statePick, setStatePick] = useState<string>(LOCATION_NONE);
  const [cityPick, setCityPick] = useState<string>(LOCATION_NONE);
  const countryOptions = useMemo(() => getCountryOptions(), []);
  const resolvedCountryCode = useMemo(() => {
    if (countryPick !== LOCATION_NONE) return countryPick;
    const typed = formData.country.trim().toLowerCase();
    if (!typed) return "";
    const row = countryOptions.find((c) => c.name.trim().toLowerCase() === typed);
    return row?.code ?? "";
  }, [countryPick, formData.country, countryOptions]);
  const stateOptions = useMemo(() => getStateOptions(resolvedCountryCode), [resolvedCountryCode]);
  const resolvedStateCode = useMemo(() => {
    if (statePick !== LOCATION_NONE) return statePick;
    const typed = formData.state.trim().toLowerCase();
    if (!typed) return "";
    const row = stateOptions.find((s) => s.name.trim().toLowerCase() === typed);
    return row?.code ?? "";
  }, [statePick, formData.state, stateOptions]);
  const cityOptions = useMemo(
    () => getCityOptions(resolvedCountryCode, resolvedStateCode),
    [resolvedCountryCode, resolvedStateCode],
  );
  /** Free-text fields — avoid splitting on every keystroke (fixes “input not working”) */
  const [achievementsText, setAchievementsText] = useState("");
  const [certificationsText, setCertificationsText] = useState("");

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "image");
      fd.append("folder", "speakers/avatars");

      const result = await apiFetch<{
        success?: boolean;
        secure_url?: string;
        public_id?: string;
        error?: string;
      }>("/api/admin/upload", { method: "POST", body: fd, auth: true });

      if (result?.success && result?.secure_url) {
        setProfileImage(result.secure_url);
      } else {
        throw new Error(result?.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setUploadError(null);
  };

  const handleAddCategory = () => {
    const t = newCategory.trim();
    if (t && !categories.includes(t)) {
      setCategories((c) => [...c, t]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories((c) => c.filter((x) => x !== categoryToRemove));
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveSpeaker = async () => {
    if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
      alert("Please fill in all required fields: First Name, Last Name, and Email");
      return;
    }

    const achievements = achievementsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const certifications = certificationsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      const speakerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        company: formData.company.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
        location: [formData.city, formData.state, formData.country].filter(Boolean).join(", ") || formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        linkedin: formData.linkedin.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
        // No `facebook` column on User — omit (or add schema later)
        avatar: profileImage || undefined,
        specialties: categories,
        achievements,
        certifications,
        speakingExperience: formData.speakingExperience.trim() || undefined,
      };

      const result = await apiFetch<{ success?: boolean; error?: string }>("/api/admin/speakers", {
        method: "POST",
        body: speakerData,
        auth: true,
      });

      if (result?.success) {
        alert("Speaker created successfully!");
        setFormData(emptyForm);
        setCountryPick(LOCATION_NONE);
        setStatePick(LOCATION_NONE);
        setCityPick(LOCATION_NONE);
        setProfileImage(null);
        setCategories([]);
        setAchievementsText("");
        setCertificationsText("");
        setNewCategory("");
      } else {
        throw new Error(result?.error || "Failed to create speaker");
      }
    } catch (error) {
      console.error("Error saving speaker:", error);
      alert(`Error saving speaker: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const busy = uploading || saving;

  return (
    <div className="w-full p-8 border border-[#00AEEF] rounded-lg bg-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Add Speaker</h1>
        <button
          type="button"
          onClick={() => void handleSaveSpeaker()}
          disabled={busy}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {uploading ? "Uploading…" : saving ? "Saving…" : "Save Speaker"}
        </button>
      </div>

      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Upload Error:</strong> {uploadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col items-center border rounded-xl p-6 bg-white shadow-sm">
          <div className="relative w-32 h-32 mb-4 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
            {profileImage ? (
              <>
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={busy}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:bg-gray-400"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-4 pointer-events-none">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 block">
                  {uploading ? "Uploading…" : "Click to upload"}
                </span>
                <span className="text-xs text-gray-400 block mt-1">PNG, JPG, WEBP (max 10MB)</span>
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
              onChange={(e) => void handleImageUpload(e)}
              disabled={busy}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              aria-label="Upload profile image"
            />
          </div>

          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="text-lg font-semibold text-center border border-gray-200 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="First Name *"
            autoComplete="given-name"
          />
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="text-lg font-semibold text-center border border-gray-200 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Last Name *"
            autoComplete="family-name"
          />
          <input
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            className="text-sm text-gray-600 text-center border border-gray-200 rounded px-2 py-1 mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Designation"
          />
          <input
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="text-xs text-gray-500 text-center border border-gray-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Company"
          />
        </div>

        <div className="lg:col-span-2 border rounded-xl p-6 shadow-sm bg-white">
          <h2 className="font-semibold mb-4 text-[16px]">Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="input border border-gray-200 rounded px-3 py-2"
              placeholder="Company Name"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              className="input border border-gray-200 rounded px-3 py-2"
              placeholder="Email *"
              autoComplete="email"
            />
            <input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="input border border-gray-200 rounded px-3 py-2"
              placeholder="Designation"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type="tel"
              className="input border border-gray-200 rounded px-3 py-2"
              placeholder="Mobile"
              autoComplete="tel"
            />
            <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800 mb-3">Location</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Country</Label>
                  <Select
                    value={countryPick}
                    onValueChange={(value) => {
                      setCountryPick(value);
                      if (value === LOCATION_NONE) return;
                      const row = countryOptions.find((c) => c.code === value);
                      if (!row) return;
                      setStatePick(LOCATION_NONE);
                      setCityPick(LOCATION_NONE);
                      setFormData((prev) => ({ ...prev, country: row.name, state: "", city: "", location: row.name }));
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">State</Label>
                  <Select
                    value={statePick}
                    onValueChange={(value) => {
                      setStatePick(value);
                      if (value === LOCATION_NONE) return;
                      const row = stateOptions.find((s) => s.code === value);
                      if (!row) return;
                      setCityPick(LOCATION_NONE);
                      setFormData((prev) => ({ ...prev, state: row.name, city: "" }));
                    }}
                    disabled={!resolvedCountryCode}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder={!resolvedCountryCode ? "Select country first" : "Select state"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                      {stateOptions.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">City</Label>
                  <Select
                    value={cityPick}
                    onValueChange={(value) => {
                      setCityPick(value);
                      if (value === LOCATION_NONE) return;
                      const row = cityOptions.find((c) => c.name === value);
                      if (!row) return;
                      setFormData((prev) => ({
                        ...prev,
                        city: row.name,
                        location: [row.name, prev.state, prev.country].filter(Boolean).join(", "),
                      }));
                    }}
                    disabled={!resolvedCountryCode || !resolvedStateCode}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue
                        placeholder={
                          !resolvedCountryCode ? "Select country first" : !resolvedStateCode ? "Select state first" : "Select city"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LOCATION_NONE}>-- None --</SelectItem>
                      {cityOptions.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <input
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              type="url"
              className="input border border-gray-200 rounded px-3 py-2"
              placeholder="Website"
            />
          </div>
        </div>

        <div className="border rounded-xl p-6 shadow-sm bg-white lg:col-span-3">
          <h2 className="font-semibold mb-4 text-[16px]">Social Media Links</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Linkedin size={16} className="text-gray-500 shrink-0" />
              <input
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="input flex-1 border border-gray-200 rounded px-3 py-2"
                placeholder="LinkedIn profile URL"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter size={16} className="text-gray-500 shrink-0" />
              <input
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                className="input flex-1 border border-gray-200 rounded px-3 py-2"
                placeholder="Twitter / X profile URL"
              />
            </div>
            <div className="flex items-center gap-2">
              <Facebook size={16} className="text-gray-500 shrink-0" />
              <input
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                className="input flex-1 border border-gray-200 rounded px-3 py-2"
                placeholder="Facebook (not stored yet — add DB field to persist)"
              />
            </div>
            <div className="flex items-center gap-2">
              <Instagram size={16} className="text-gray-500 shrink-0" />
              <input
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className="input flex-1 border border-gray-200 rounded px-3 py-2"
                placeholder="Instagram profile URL"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h2 className="font-semibold mb-3">Professional Bio</h2>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="input h-[120px] w-full border border-gray-200 rounded px-3 py-2"
            placeholder="Enter professional bio"
          />
        </div>

        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h2 className="font-semibold mb-3">Speaking Experience</h2>
          <textarea
            name="speakingExperience"
            value={formData.speakingExperience}
            onChange={handleInputChange}
            className="input h-[120px] w-full border border-gray-200 rounded px-3 py-2"
            placeholder="Enter speaking experience"
          />
        </div>
      </div>

      <div className="border rounded-xl p-6 shadow-sm bg-white mt-8">
        <h2 className="font-semibold mb-3">Speaker Specialties</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          {categories.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm border flex items-center gap-2"
            >
              {tag}
              <button type="button" onClick={() => handleRemoveCategory(tag)} className="hover:text-red-500">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1 border border-gray-200 rounded px-3 py-2"
            placeholder="Add new specialty"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleCategoryKeyDown}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h2 className="font-semibold mb-3">Achievements</h2>
          <textarea
            value={achievementsText}
            onChange={(e) => setAchievementsText(e.target.value)}
            className="input h-[120px] w-full border border-gray-200 rounded px-3 py-2"
            placeholder="Enter achievements (comma separated)"
          />
        </div>

        <div className="border rounded-xl p-6 shadow-sm bg-white">
          <h2 className="font-semibold mb-3">Certifications</h2>
          <textarea
            value={certificationsText}
            onChange={(e) => setCertificationsText(e.target.value)}
            className="input h-[120px] w-full border border-gray-200 rounded px-3 py-2"
            placeholder="Enter certifications (comma separated)"
          />
        </div>
      </div>
    </div>
  );
}
