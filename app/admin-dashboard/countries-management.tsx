"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  MapPin,
  Globe,
  Eye,
  EyeOff
} from "lucide-react"
import CloudinaryUpload from "@/components/cloudinary-upload"
import { apiFetch } from "@/lib/api"
import { getCountryOptions } from "@/lib/location-data"

interface Country {
  id: string
  name: string
  code: string
  flag?: string
  flagPublicId?: string
  currency?: string
  timezone?: string
  isActive: boolean
  isPermitted: boolean
  eventCount: number
  cityCount: number
  createdAt: string
  updatedAt: string
  cities?: City[]
}

interface City {
  id: string
  name: string
  state: string
  countryId: string
  latitude?: number
  longitude?: number
  timezone?: string
  image?: string
  imagePublicId?: string
  isActive: boolean
  isPermitted: boolean
  eventCount: number
  createdAt: string
  updatedAt: string
  country?: {
    id: string
    name: string
    code: string
  }
}

interface CountriesManagementProps {
  activeTab?: "countries" | "states" | "cities"
}

interface StateRow {
  id: string
  name: string
  countryId: string
  isActive: boolean
  isPermitted: boolean
  eventCount: number
  cityCount: number
  country?: {
    id: string
    name: string
    code: string
  }
}

export default function CountriesManagement({ activeTab = "countries" }: CountriesManagementProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentActiveTab, setCurrentActiveTab] = useState<"countries" | "states" | "cities">(activeTab)
  const [selectedStateCountry, setSelectedStateCountry] = useState("")
  const [states, setStates] = useState<StateRow[]>([])
  const [showCountryForm, setShowCountryForm] = useState(false)
  const [showStateForm, setShowStateForm] = useState(false)
  const [showCityForm, setShowCityForm] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [editingState, setEditingState] = useState<StateRow | null>(null)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  
  const [countryFormData, setCountryFormData] = useState({
    name: "",
    code: "",
    flag: "",
    currency: "USD",
    timezone: "UTC",
    isActive: true,
    isPermitted: false
  })

  const [cityFormData, setCityFormData] = useState({
    name: "",
    state: "",
    countryId: "",
    latitude: "",
    longitude: "",
    timezone: "UTC",
    image: "",
    isActive: true,
    isPermitted: false
  })
  const [stateFormData, setStateFormData] = useState({
    name: "",
    countryId: "",
    isActive: true,
    isPermitted: false,
  })

  // Update active tab when prop changes
  useEffect(() => {
    setCurrentActiveTab(activeTab)
  }, [activeTab])

  useEffect(() => {
    fetchData()
  }, [currentActiveTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (currentActiveTab === "countries") {
        const data = await apiFetch<Country[]>("/api/admin/countries?includeCounts=true", { auth: true })
        setCountries(Array.isArray(data) ? data : [])
      } else if (currentActiveTab === "states") {
        const [countryData, statesData] = await Promise.all([
          apiFetch<Country[]>("/api/admin/countries?includeCounts=true", { auth: true }),
          apiFetch<StateRow[]>("/api/admin/states?includeCounts=true", { auth: true }),
        ])
        setCountries(Array.isArray(countryData) ? countryData : [])
        setStates(Array.isArray(statesData) ? statesData : [])
      } else {
        const data = await apiFetch<City[]>("/api/admin/cities?includeCounts=true", { auth: true })
        setCities(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const path = editingCountry
        ? `/api/admin/countries/${editingCountry.id}`
        : "/api/admin/countries"
      const method = editingCountry ? "PUT" : "POST"
      await apiFetch(path, {
        method,
        auth: true,
        body: {
          name: countryFormData.name,
          code: countryFormData.code,
          flag: countryFormData.flag && countryFormData.flag.startsWith("http") ? countryFormData.flag : "",
          currency: countryFormData.currency,
          timezone: countryFormData.timezone,
          isActive: countryFormData.isActive,
          isPermitted: countryFormData.isPermitted,
        },
      })
      setShowCountryForm(false)
      setEditingCountry(null)
      setCountryFormData({
        name: "",
        code: "",
        flag: "",
        currency: "USD",
        timezone: "UTC",
        isActive: true,
        isPermitted: false,
      })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to save country")
    }
  }

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const path = editingCity
        ? `/api/admin/cities/${editingCity.id}`
        : "/api/admin/cities"
      const method = editingCity ? "PUT" : "POST"
      await apiFetch(path, {
        method,
        auth: true,
        body: {
          name: cityFormData.name,
          state: cityFormData.state,
          countryId: cityFormData.countryId,
          latitude: cityFormData.latitude ? parseFloat(cityFormData.latitude) : undefined,
          longitude: cityFormData.longitude ? parseFloat(cityFormData.longitude) : undefined,
          timezone: cityFormData.timezone,
          image: cityFormData.image && cityFormData.image.startsWith("http") ? cityFormData.image : "",
          isActive: cityFormData.isActive,
          isPermitted: cityFormData.isPermitted,
        },
      })
      setShowCityForm(false)
      setEditingCity(null)
      setCityFormData({
        name: "",
        state: "",
        countryId: "",
        latitude: "",
        longitude: "",
        timezone: "UTC",
        image: "",
        isActive: true,
        isPermitted: false,
      })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to save city")
    }
  }

  const handleStateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const path = editingState ? `/api/admin/states/${editingState.id}` : "/api/admin/states"
      const method = editingState ? "PUT" : "POST"
      await apiFetch(path, {
        method,
        auth: true,
        body: {
          name: stateFormData.name,
          countryId: stateFormData.countryId,
          isActive: stateFormData.isActive,
          isPermitted: stateFormData.isPermitted,
        },
      })
      setShowStateForm(false)
      setEditingState(null)
      setStateFormData({
        name: "",
        countryId: "",
        isActive: true,
        isPermitted: false,
      })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to save state")
    }
  }

  const handleDeleteCountry = async (countryId: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return
    try {
      await apiFetch(`/api/admin/countries/${countryId}`, { method: "DELETE", auth: true })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to delete country")
    }
  }

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm("Are you sure you want to delete this city?")) return
    try {
      await apiFetch(`/api/admin/cities/${cityId}`, { method: "DELETE", auth: true })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to delete city")
    }
  }
  const handleDeleteState = async (stateId: string) => {
    if (!confirm("Are you sure you want to delete this state?")) return
    try {
      await apiFetch(`/api/admin/states/${stateId}`, { method: "DELETE", auth: true })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to delete state")
    }
  }

  const handleToggleCountryPermission = async (countryId: string, currentPermission: boolean) => {
    try {
      await apiFetch(`/api/admin/countries/${countryId}`, {
        method: "PUT",
        auth: true,
        body: { isPermitted: !currentPermission },
      })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to update country permission")
    }
  }

  const handleToggleCityPermission = async (cityId: string, currentPermission: boolean) => {
    try {
      await apiFetch(`/api/admin/cities/${cityId}`, {
        method: "PUT",
        auth: true,
        body: { isPermitted: !currentPermission },
      })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to update city permission")
    }
  }
  const handleToggleStatePermission = async (stateId: string, currentPermission: boolean) => {
    try {
      await apiFetch(`/api/admin/states/${stateId}`, {
        method: "PUT",
        auth: true,
        body: { isPermitted: !currentPermission },
      })
      fetchData()
    } catch (err: any) {
      alert(err?.body?.error || err?.message || "Failed to update state permission")
    }
  }

  const handleFlagUpload = (flagUrl: string) => {
    setCountryFormData(prev => ({
      ...prev,
      flag: flagUrl
    }))
  }

  const handleCityImageUpload = (imageUrl: string) => {
    setCityFormData(prev => ({
      ...prev,
      image: imageUrl
    }))
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredStates = states
    .filter((s) => !selectedStateCountry || s.country?.code === selectedStateCountry)
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
  const stateCountryOptions: Array<{ code: string; name: string }> =
    countries.length > 0
      ? countries.map((c) => ({ code: c.code, name: c.name }))
      : getCountryOptions()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-600">Manage countries, states and cities for events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setCurrentActiveTab("countries")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentActiveTab === "countries"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Countries ({countries.length})
          </button>
          <button
            onClick={() => setCurrentActiveTab("states")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentActiveTab === "states"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            States
          </button>
          <button
            onClick={() => setCurrentActiveTab("cities")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentActiveTab === "cities"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Cities ({cities.length})
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${currentActiveTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        {currentActiveTab === "countries" ? (
          <button
            onClick={() => {
              setEditingCountry(null)
              setCountryFormData({
                name: "",
                code: "",
                flag: "",
                currency: "USD",
                timezone: "UTC",
                isActive: true,
                isPermitted: false
              })
              setShowCountryForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        ) : currentActiveTab === "states" ? (
          <button
            onClick={() => {
              setEditingState(null)
              setStateFormData({
                name: "",
                countryId: "",
                isActive: true,
                isPermitted: false,
              })
              setShowStateForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add State
          </button>
        ) : currentActiveTab === "cities" ? (
          <button
            onClick={() => {
              setEditingCity(null)
              setCityFormData({
                name: "",
                state: "",
                countryId: "",
                latitude: "",
                longitude: "",
                timezone: "UTC",
                image: "",
                isActive: true,
                isPermitted: false
              })
              setShowCityForm(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add City
          </button>
        ) : null}
      </div>

      {currentActiveTab === "states" && (
        <div className="space-y-4">
          <div className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={selectedStateCountry}
              onChange={(e) => setSelectedStateCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select country</option>
              {stateCountryOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {!selectedStateCountry ? (
              <p className="text-sm text-gray-600">Select a country to view states.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredStates.map((s) => (
                  <div key={s.id} className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-slate-900">{s.name}</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatePermission(s.id, s.isPermitted)}
                          className={`p-1 rounded transition-colors ${
                            s.isPermitted ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                          }`}
                          title={s.isPermitted ? "Hide from public" : "Show on public pages"}
                        >
                          {s.isPermitted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingState(s)
                            setStateFormData({
                              name: s.name,
                              countryId: s.countryId,
                              isActive: s.isActive,
                              isPermitted: s.isPermitted,
                            })
                            setShowStateForm(true)
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteState(s.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {s.eventCount} events • {s.cityCount} cities
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentActiveTab === "countries" ? (
          <>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{countries.length}</div>
              <div className="text-sm text-gray-600">Total Countries</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {countries.filter(c => c.isPermitted).length}
              </div>
              <div className="text-sm text-gray-600">Public Countries</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {countries.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Countries</div>
            </div>
          </>
        ) : currentActiveTab === "cities" ? (
          <>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{cities.length}</div>
              <div className="text-sm text-gray-600">Total Cities</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {cities.filter(c => c.isPermitted).length}
              </div>
              <div className="text-sm text-gray-600">Public Cities</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {cities.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Cities</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {selectedStateCountry ? filteredStates.length : 0}
              </div>
              <div className="text-sm text-gray-600">Total States</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {selectedStateCountry ? filteredStates.reduce((sum, s) => sum + s.eventCount, 0) : 0}
              </div>
              <div className="text-sm text-gray-600">State Events</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {selectedStateCountry ? filteredStates.reduce((sum, s) => sum + s.cityCount, 0) : 0}
              </div>
              <div className="text-sm text-gray-600">Mapped Cities</div>
            </div>
          </>
        )}
      </div>

      {/* Countries Grid */}
      {currentActiveTab === "countries" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country) => (
            <div
              key={country.id}
              className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
                country.isPermitted ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {country.flag ? (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                      <img 
                        src={country.flag} 
                        alt={`${country.name} flag`}
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                      <Globe className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{country.name}</h3>
                    <p className="text-sm text-gray-600">{country.code}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{country.eventCount}</p>
                  <p className="text-xs text-gray-600">Events</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{country.cityCount}</p>
                  <p className="text-xs text-gray-600">Cities</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {country.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${country.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {country.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {/* Permission Toggle */}
                  <button
                    onClick={() => handleToggleCountryPermission(country.id, country.isPermitted)}
                    className={`p-1 rounded transition-colors ${
                      country.isPermitted 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={country.isPermitted ? 'Hide from public' : 'Show on public pages'}
                  >
                    {country.isPermitted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCountry(country)
                      setCountryFormData({
                        name: country.name,
                        code: country.code,
                        flag: country.flag || "",
                        currency: country.currency || "USD",
                        timezone: country.timezone || "UTC",
                        isActive: country.isActive,
                        isPermitted: country.isPermitted
                      })
                      setShowCountryForm(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCountry(country.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cities Grid */}
      {currentActiveTab === "cities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => (
            <div
              key={city.id}
              className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
                city.isPermitted ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {city.image ? (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                      <img 
                        src={city.image} 
                        alt={`${city.name} image`}
                        className="w-12 h-12 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                      <MapPin className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{city.name}</h3>
                    <p className="text-sm text-gray-600">{city.state}, {city.country?.name}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-gray-900">{city.eventCount}</p>
                <p className="text-xs text-gray-600">Events</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {city.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${city.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {city.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {/* Permission Toggle */}
                  <button
                    onClick={() => handleToggleCityPermission(city.id, city.isPermitted)}
                    className={`p-1 rounded transition-colors ${
                      city.isPermitted 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={city.isPermitted ? 'Hide from public' : 'Show on public pages'}
                  >
                    {city.isPermitted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCity(city)
                      setCityFormData({
                        name: city.name,
                        state: city.state || "",
                        countryId: city.countryId,
                        latitude: city.latitude?.toString() || "",
                        longitude: city.longitude?.toString() || "",
                        timezone: city.timezone || "UTC",
                        image: city.image || "",
                        isActive: city.isActive,
                        isPermitted: city.isPermitted
                      })
                      setShowCityForm(true)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCity(city.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {currentActiveTab === "countries" && filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🌎</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No countries found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first country"}
          </p>
        </div>
      )}

      {currentActiveTab === "cities" && filteredCities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cities found</h3>
          <p className="text-gray-600">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first city"}
          </p>
        </div>
      )}

      {/* Country Form Modal */}
      {showCountryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingCountry ? 'Edit Country' : 'Add New Country'}
              </h2>
              
              <form onSubmit={handleCountrySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={countryFormData.name}
                    onChange={(e) => setCountryFormData({ ...countryFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter country name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={countryFormData.code}
                    onChange={(e) => setCountryFormData({ ...countryFormData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    placeholder="e.g., USA, IND, UK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country Flag
                  </label>
                  <CloudinaryUpload
                    onUploadComplete={handleFlagUpload}
                    currentImage={countryFormData.flag}
                    folder="flags"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a flag image for this country
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={countryFormData.currency}
                      onChange={(e) => setCountryFormData({ ...countryFormData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., USD, INR, EUR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={countryFormData.timezone}
                      onChange={(e) => setCountryFormData({ ...countryFormData, timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., UTC, EST, IST"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="countryIsActive"
                      checked={countryFormData.isActive}
                      onChange={(e) => setCountryFormData({ ...countryFormData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="countryIsActive" className="text-sm text-gray-700">
                      Active Country
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="countryIsPermitted"
                      checked={countryFormData.isPermitted}
                      onChange={(e) => setCountryFormData({ ...countryFormData, isPermitted: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="countryIsPermitted" className="text-sm text-gray-700">
                      Show on public pages
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCountry ? 'Update Country' : 'Create Country'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCountryForm(false)
                      setEditingCountry(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* City Form Modal */}
      {showStateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingState ? "Edit State" : "Add New State"}</h2>
              <form onSubmit={handleStateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State Name *</label>
                  <input
                    type="text"
                    required
                    value={stateFormData.name}
                    onChange={(e) => setStateFormData({ ...stateFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter state name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    required
                    value={stateFormData.countryId}
                    onChange={(e) => setStateFormData({ ...stateFormData, countryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stateIsActive"
                      checked={stateFormData.isActive}
                      onChange={(e) => setStateFormData({ ...stateFormData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="stateIsActive" className="text-sm text-gray-700">
                      Active State
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stateIsPermitted"
                      checked={stateFormData.isPermitted}
                      onChange={(e) => setStateFormData({ ...stateFormData, isPermitted: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="stateIsPermitted" className="text-sm text-gray-700">
                      Show on public pages
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingState ? "Update State" : "Create State"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStateForm(false)
                      setEditingState(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* City Form Modal */}
      {showCityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingCity ? 'Edit City' : 'Add New City'}
              </h2>
              
              <form onSubmit={handleCitySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityFormData.name}
                    onChange={(e) => setCityFormData({ ...cityFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter city name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityFormData.state}
                    onChange={(e) => setCityFormData({ ...cityFormData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    required
                    value={cityFormData.countryId}
                    onChange={(e) => setCityFormData({ ...cityFormData, countryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a country</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City Image
                  </label>
                  <CloudinaryUpload
                    onUploadComplete={handleCityImageUpload}
                    currentImage={cityFormData.image}
                    folder="cities"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image for this city
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cityFormData.latitude}
                      onChange={(e) => setCityFormData({ ...cityFormData, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 40.7128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cityFormData.longitude}
                      onChange={(e) => setCityFormData({ ...cityFormData, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., -74.0060"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={cityFormData.timezone}
                    onChange={(e) => setCityFormData({ ...cityFormData, timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., America/New_York"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cityIsActive"
                      checked={cityFormData.isActive}
                      onChange={(e) => setCityFormData({ ...cityFormData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="cityIsActive" className="text-sm text-gray-700">
                      Active City
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cityIsPermitted"
                      checked={cityFormData.isPermitted}
                      onChange={(e) => setCityFormData({ ...cityFormData, isPermitted: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="cityIsPermitted" className="text-sm text-gray-700">
                      Show on public pages
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCity ? 'Update City' : 'Create City'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCityForm(false)
                      setEditingCity(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}