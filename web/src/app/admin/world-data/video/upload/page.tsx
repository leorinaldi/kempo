"use client"

import { useSession } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Person {
  id: string
  firstName: string
  lastName: string
  stageName: string | null
}

interface Organization {
  id: string
  name: string
  abbreviation: string | null
}

interface Brand {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
}

interface Genre {
  id: string
  name: string
  slug: string
}

interface TrailerType {
  id: string
  name: string
}

interface AdType {
  id: string
  name: string
}

interface ContentType {
  id: string
  name: string
}

interface Series {
  id: string
  title: string
}

interface KempoTubeChannel {
  id: string
  name: string
}

interface FlipFlopAccount {
  id: string
  name: string
}

interface TvChannel {
  id: string
  name: string
  callSign: string | null
}

type VideoType = "movie" | "trailer" | "commercial" | "tvShow" | "online"

export default function VideoUploadPage() {
  const { data: session, status } = useSession()
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lookup data
  const [genres, setGenres] = useState<Genre[]>([])
  const [trailerTypes, setTrailerTypes] = useState<TrailerType[]>([])
  const [adTypes, setAdTypes] = useState<AdType[]>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [studios, setStudios] = useState<Organization[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [kempoTubeChannels, setKempoTubeChannels] = useState<KempoTubeChannel[]>([])
  const [flipFlopAccounts, setFlipFlopAccounts] = useState<FlipFlopAccount[]>([])
  const [tvChannels, setTvChannels] = useState<TvChannel[]>([])

  // Video dimensions and duration (auto-detected)
  const [detectedWidth, setDetectedWidth] = useState<number | null>(null)
  const [detectedHeight, setDetectedHeight] = useState<number | null>(null)
  const [detectedDuration, setDetectedDuration] = useState<number | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "online" as VideoType,
    selectedGenres: [] as string[],
    // Movie-specific
    studioId: "",
    releaseYear: "",
    runtime: "",
    // Trailer-specific
    trailerTypeId: "",
    trailerNumber: "",
    forMovieId: "",
    forSeriesId: "",
    // Commercial-specific
    brandId: "",
    productId: "",
    agencyId: "",
    adTypeId: "",
    campaign: "",
    airYear: "",
    // TV Show-specific
    seriesId: "",
    seasonNum: "",
    episodeNum: "",
    episodeTitle: "",
    // Online-specific
    creatorId: "",
    contentTypeId: "",
    // Platform assignments
    kempoTubeChannelId: "",
    flipFlopAccountId: "",
    tvChannelId: "",
    publishToKempoTube: false,
    publishToFlipFlop: false,
    publishToTv: false,
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const [
        genresRes,
        trailerTypesRes,
        adTypesRes,
        contentTypesRes,
        seriesRes,
        studiosRes,
        brandsRes,
        productsRes,
        peopleRes,
        kempoTubeChannelsRes,
        flipFlopAccountsRes,
        tvChannelsRes,
      ] = await Promise.all([
        fetch("/api/genres"),
        fetch("/api/trailer-types"),
        fetch("/api/ad-types"),
        fetch("/api/content-types"),
        fetch("/api/series"),
        fetch("/api/entities/organizations?orgType=studio"),
        fetch("/api/entities/brands"),
        fetch("/api/entities/products"),
        fetch("/api/entities/people"),
        fetch("/api/kempotube-channels"),
        fetch("/api/flipflop-accounts"),
        fetch("/api/tv-channels"),
      ])

      const [
        genresData,
        trailerTypesData,
        adTypesData,
        contentTypesData,
        seriesData,
        studiosData,
        brandsData,
        productsData,
        peopleData,
        kempoTubeChannelsData,
        flipFlopAccountsData,
        tvChannelsData,
      ] = await Promise.all([
        genresRes.json(),
        trailerTypesRes.json(),
        adTypesRes.json(),
        contentTypesRes.json(),
        seriesRes.json(),
        studiosRes.json(),
        brandsRes.json(),
        productsRes.json(),
        peopleRes.json(),
        kempoTubeChannelsRes.json(),
        flipFlopAccountsRes.json(),
        tvChannelsRes.json(),
      ])

      if (Array.isArray(genresData)) setGenres(genresData)
      if (Array.isArray(trailerTypesData)) setTrailerTypes(trailerTypesData)
      if (Array.isArray(adTypesData)) setAdTypes(adTypesData)
      if (Array.isArray(contentTypesData)) setContentTypes(contentTypesData)
      if (Array.isArray(seriesData)) setSeries(seriesData)
      if (Array.isArray(studiosData)) setStudios(studiosData)
      if (Array.isArray(brandsData)) setBrands(brandsData)
      if (Array.isArray(productsData)) setProducts(productsData)
      if (Array.isArray(peopleData)) setPeople(peopleData)
      if (Array.isArray(kempoTubeChannelsData)) setKempoTubeChannels(kempoTubeChannelsData)
      if (Array.isArray(flipFlopAccountsData)) setFlipFlopAccounts(flipFlopAccountsData)
      if (Array.isArray(tvChannelsData)) setTvChannels(tvChannelsData)
    } catch (err) {
      console.error("Failed to load data:", err)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  if (!session.user.isAdmin) {
    redirect("/admin")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setDetectedWidth(null)
      setDetectedHeight(null)
      setDetectedDuration(null)
      return
    }

    // Auto-detect video dimensions and duration using HTML5 video element
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      setDetectedWidth(video.videoWidth)
      setDetectedHeight(video.videoHeight)
      setDetectedDuration(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.onerror = () => {
      setDetectedWidth(null)
      setDetectedHeight(null)
      setDetectedDuration(null)
    }
    video.src = URL.createObjectURL(file)
  }

  const handleGenreToggle = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter((g) => g !== genreId)
        : [...prev.selectedGenres, genreId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]

    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload" })
      return
    }

    if (!formData.title) {
      setMessage({ type: "error", text: "Please provide a title" })
      return
    }

    // Validate type-specific required fields
    if (formData.videoType === "commercial" && !formData.adTypeId) {
      setMessage({ type: "error", text: "Please select an ad type for commercials" })
      return
    }
    if (formData.videoType === "trailer" && !formData.trailerTypeId) {
      setMessage({ type: "error", text: "Please select a trailer type" })
      return
    }
    if (formData.videoType === "online" && !formData.contentTypeId) {
      setMessage({ type: "error", text: "Please select a content type for online videos" })
      return
    }
    if (formData.videoType === "tvShow" && !formData.seriesId) {
      setMessage({ type: "error", text: "Please select a series for TV episodes" })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("title", formData.title)
      uploadFormData.append("description", formData.description)
      uploadFormData.append("videoType", formData.videoType)
      uploadFormData.append("genreIds", JSON.stringify(formData.selectedGenres))

      if (detectedWidth) uploadFormData.append("width", detectedWidth.toString())
      if (detectedHeight) uploadFormData.append("height", detectedHeight.toString())
      if (detectedDuration) uploadFormData.append("duration", detectedDuration.toString())

      // Type-specific metadata
      if (formData.videoType === "movie") {
        if (formData.studioId) uploadFormData.append("studioId", formData.studioId)
        if (formData.releaseYear) uploadFormData.append("releaseYear", formData.releaseYear)
        if (formData.runtime) uploadFormData.append("runtime", formData.runtime)
      } else if (formData.videoType === "trailer") {
        uploadFormData.append("trailerTypeId", formData.trailerTypeId)
        if (formData.trailerNumber) uploadFormData.append("trailerNumber", formData.trailerNumber)
        if (formData.forMovieId) uploadFormData.append("forMovieId", formData.forMovieId)
        if (formData.forSeriesId) uploadFormData.append("forSeriesId", formData.forSeriesId)
      } else if (formData.videoType === "commercial") {
        uploadFormData.append("adTypeId", formData.adTypeId)
        if (formData.brandId) uploadFormData.append("brandId", formData.brandId)
        if (formData.productId) uploadFormData.append("productId", formData.productId)
        if (formData.agencyId) uploadFormData.append("agencyId", formData.agencyId)
        if (formData.campaign) uploadFormData.append("campaign", formData.campaign)
        if (formData.airYear) uploadFormData.append("airYear", formData.airYear)
      } else if (formData.videoType === "tvShow") {
        uploadFormData.append("seriesId", formData.seriesId)
        if (formData.seasonNum) uploadFormData.append("seasonNum", formData.seasonNum)
        if (formData.episodeNum) uploadFormData.append("episodeNum", formData.episodeNum)
        if (formData.episodeTitle) uploadFormData.append("episodeTitle", formData.episodeTitle)
      } else if (formData.videoType === "online") {
        uploadFormData.append("contentTypeId", formData.contentTypeId)
        if (formData.creatorId) uploadFormData.append("creatorId", formData.creatorId)
      }

      // Platform assignments
      if (formData.publishToKempoTube && formData.kempoTubeChannelId) {
        uploadFormData.append("kempoTubeChannelId", formData.kempoTubeChannelId)
      }
      if (formData.publishToFlipFlop && formData.flipFlopAccountId) {
        uploadFormData.append("flipFlopAccountId", formData.flipFlopAccountId)
      }
      if (formData.publishToTv && formData.tvChannelId) {
        uploadFormData.append("tvChannelId", formData.tvChannelId)
      }

      const response = await fetch("/api/video/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setMessage({ type: "success", text: "Video uploaded successfully!" })
      setUploadedUrl(result.url)

      // Reset form
      setFormData({
        title: "",
        description: "",
        videoType: "online",
        selectedGenres: [],
        studioId: "",
        releaseYear: "",
        runtime: "",
        trailerTypeId: "",
        trailerNumber: "",
        forMovieId: "",
        forSeriesId: "",
        brandId: "",
        productId: "",
        agencyId: "",
        adTypeId: "",
        campaign: "",
        airYear: "",
        seriesId: "",
        seasonNum: "",
        episodeNum: "",
        episodeTitle: "",
        creatorId: "",
        contentTypeId: "",
        kempoTubeChannelId: "",
        flipFlopAccountId: "",
        tvChannelId: "",
        publishToKempoTube: false,
        publishToFlipFlop: false,
        publishToTv: false,
      })
      setDetectedWidth(null)
      setDetectedHeight(null)
      setDetectedDuration(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  const videoTypeLabels: Record<VideoType, string> = {
    movie: "Movie",
    trailer: "Trailer",
    commercial: "Commercial",
    tvShow: "TV Episode",
    online: "Online Clip",
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/world-data/video" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-green-600">Upload New Video</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {uploadedUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-medium text-blue-700">Uploaded URL:</p>
              <code className="text-xs break-all">{uploadedUrl}</code>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Info</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., Abilene Dawn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.videoType}
                  onChange={(e) => setFormData({ ...formData, videoType: e.target.value as VideoType })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {Object.entries(videoTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                {(detectedWidth && detectedHeight) || detectedDuration ? (
                  <p className="mt-1 text-sm text-gray-500">
                    Detected: {detectedWidth && detectedHeight ? `${detectedWidth} x ${detectedHeight} pixels` : ""}
                    {detectedWidth && detectedHeight && detectedDuration ? " · " : ""}
                    {detectedDuration
                      ? `${Math.floor(detectedDuration / 60)}:${Math.floor(detectedDuration % 60)
                          .toString()
                          .padStart(2, "0")}`
                      : ""}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Genres (for movie/tvShow) */}
            {(formData.videoType === "movie" || formData.videoType === "tvShow") && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleGenreToggle(genre.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.selectedGenres.includes(genre.id)
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type-Specific Fields */}
            {formData.videoType === "movie" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Movie Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Studio</label>
                    <select
                      value={formData.studioId}
                      onChange={(e) => setFormData({ ...formData, studioId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select studio --</option>
                      {studios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={formData.releaseYear}
                      onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="1948"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Runtime (minutes)</label>
                    <input
                      type="number"
                      value={formData.runtime}
                      onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.videoType === "trailer" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Trailer Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trailer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.trailerTypeId}
                      onChange={(e) => setFormData({ ...formData, trailerTypeId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select type --</option>
                      {trailerTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trailer Number</label>
                    <input
                      type="number"
                      value={formData.trailerNumber}
                      onChange={(e) => setFormData({ ...formData, trailerNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">For Movie</label>
                    <select
                      value={formData.forMovieId}
                      onChange={(e) => setFormData({ ...formData, forMovieId: e.target.value, forSeriesId: "" })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select movie --</option>
                      {/* Movies would be loaded separately - for now just showing placeholder */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Or For Series</label>
                    <select
                      value={formData.forSeriesId}
                      onChange={(e) => setFormData({ ...formData, forSeriesId: e.target.value, forMovieId: "" })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select series --</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.videoType === "commercial" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Commercial Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.adTypeId}
                      onChange={(e) => setFormData({ ...formData, adTypeId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select type --</option>
                      {adTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select brand --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
                    <select
                      value={formData.agencyId}
                      onChange={(e) => setFormData({ ...formData, agencyId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select agency --</option>
                      {studios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={formData.campaign}
                      onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Summer 1948"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Air Year</label>
                    <input
                      type="number"
                      value={formData.airYear}
                      onChange={(e) => setFormData({ ...formData, airYear: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="1948"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.videoType === "tvShow" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">TV Episode Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Series <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.seriesId}
                      onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select series --</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season Number</label>
                    <input
                      type="number"
                      value={formData.seasonNum}
                      onChange={(e) => setFormData({ ...formData, seasonNum: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Episode Number</label>
                    <input
                      type="number"
                      value={formData.episodeNum}
                      onChange={(e) => setFormData({ ...formData, episodeNum: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Episode Title</label>
                    <input
                      type="text"
                      value={formData.episodeTitle}
                      onChange={(e) => setFormData({ ...formData, episodeTitle: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="Pilot"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.videoType === "online" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Online Video Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.contentTypeId}
                      onChange={(e) => setFormData({ ...formData, contentTypeId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select type --</option>
                      {contentTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                    <select
                      value={formData.creatorId}
                      onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">-- Select creator --</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.stageName || `${person.firstName} ${person.lastName}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Publishing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Publish To Platforms</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="publishKempoTube"
                    checked={formData.publishToKempoTube}
                    onChange={(e) => setFormData({ ...formData, publishToKempoTube: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="publishKempoTube" className="text-sm font-medium text-gray-700">
                      KempoTube
                    </label>
                    {formData.publishToKempoTube && (
                      <select
                        value={formData.kempoTubeChannelId}
                        onChange={(e) => setFormData({ ...formData, kempoTubeChannelId: e.target.value })}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">-- Select channel --</option>
                        {kempoTubeChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="publishFlipFlop"
                    checked={formData.publishToFlipFlop}
                    onChange={(e) => setFormData({ ...formData, publishToFlipFlop: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="publishFlipFlop" className="text-sm font-medium text-gray-700">
                      FlipFlop
                    </label>
                    {formData.publishToFlipFlop && (
                      <select
                        value={formData.flipFlopAccountId}
                        onChange={(e) => setFormData({ ...formData, flipFlopAccountId: e.target.value })}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">-- Select account --</option>
                        {flipFlopAccounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="publishTv"
                    checked={formData.publishToTv}
                    onChange={(e) => setFormData({ ...formData, publishToTv: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="publishTv" className="text-sm font-medium text-gray-700">
                      TV Broadcast
                    </label>
                    {formData.publishToTv && (
                      <select
                        value={formData.tvChannelId}
                        onChange={(e) => setFormData({ ...formData, tvChannelId: e.target.value })}
                        className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">-- Select channel --</option>
                        {tvChannels.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            {ch.name} {ch.callSign ? `(${ch.callSign})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
