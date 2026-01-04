"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

type VideoType = "movie" | "trailer" | "commercial" | "tvShow" | "online"

interface Genre {
  id: string
  name: string
  slug: string
}

interface Person {
  id: string
  firstName: string
  lastName: string
  stageName: string | null
  articleId: string | null
}

interface Organization {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
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

interface VideoElement {
  id: string
  role: string
  credit: string | null
  person: Person
}

interface VideoFile {
  id: string
  name: string
  url: string
  type: VideoType
  description: string | null
  duration: number | null
  aspectRatio: string | null
  width: number | null
  height: number | null
  kyDate: string | null
  createdAt: string
  updatedAt: string
  genres: { genre: Genre }[]
  elements: VideoElement[]
  movieMetadata: {
    id: string
    releaseYear: number | null
    runtime: number | null
    studio: Organization | null
  } | null
  trailerMetadata: {
    id: string
    trailerNumber: number | null
    trailerType: { id: string; name: string }
    forMovie: { id: string; name: string } | null
    forSeries: { id: string; title: string } | null
  } | null
  commercialMetadata: {
    id: string
    campaign: string | null
    airYear: number | null
    adType: { id: string; name: string }
    brand: { id: string; name: string } | null
    product: { id: string; name: string } | null
    agency: { id: string; name: string } | null
  } | null
  tvEpisodeMetadata: {
    id: string
    seasonNum: number
    episodeNum: number
    episodeTitle: string
    series: { id: string; title: string }
  } | null
  onlineMetadata: {
    id: string
    contentType: { id: string; name: string }
    creator: Person | null
  } | null
  kempoTubeVideo: {
    id: string
    channel: { id: string; name: string }
  } | null
  flipFlopVideo: {
    id: string
    account: { id: string; name: string }
  } | null
  tvBroadcasts: {
    id: string
    tvChannel: { id: string; name: string; callSign: string | null }
  }[]
}

interface Reference {
  type: "article" | "page"
  title: string
  field: string
}

const videoTypeLabels: Record<VideoType, string> = {
  movie: "Movie",
  trailer: "Trailer",
  commercial: "Commercial",
  tvShow: "TV Episode",
  online: "Online Clip",
}

const videoTypeColors: Record<VideoType, string> = {
  movie: "bg-purple-100 text-purple-700",
  trailer: "bg-blue-100 text-blue-700",
  commercial: "bg-amber-100 text-amber-700",
  tvShow: "bg-indigo-100 text-indigo-700",
  online: "bg-green-100 text-green-700",
}

export default function VideoManagePage() {
  const { data: session, status } = useSession()

  // Video files from database
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([])

  // Lookup data
  const [genres, setGenres] = useState<Genre[]>([])
  const [trailerTypes, setTrailerTypes] = useState<TrailerType[]>([])
  const [adTypes, setAdTypes] = useState<AdType[]>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [studios, setStudios] = useState<Organization[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [kempoTubeChannels, setKempoTubeChannels] = useState<KempoTubeChannel[]>([])
  const [flipFlopAccounts, setFlipFlopAccounts] = useState<FlipFlopAccount[]>([])
  const [tvChannels, setTvChannels] = useState<TvChannel[]>([])

  // Library sorting
  const [sortField, setSortField] = useState<"name" | "createdAt" | "kyDate" | "type">("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = useState<VideoType | "all">("all")

  const stripPunctuation = (str: string) => str.replace(/^[^\w\s]+/, "").toLowerCase()

  const filteredAndSortedVideoFiles = [...videoFiles]
    .filter((v) => filterType === "all" || v.type === filterType)
    .sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = stripPunctuation(a.name).localeCompare(stripPunctuation(b.name))
      } else if (sortField === "kyDate") {
        const aDate = a.kyDate ? new Date(a.kyDate).getTime() : 0
        const bDate = b.kyDate ? new Date(b.kyDate).getTime() : 0
        comparison = aDate - bDate
      } else if (sortField === "type") {
        comparison = a.type.localeCompare(b.type)
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return sortDirection === "asc" ? comparison : -comparison
    })

  // Library state
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null)
  const [libraryMessage, setLibraryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ url: string; name: string; id: string } | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingReferences, setLoadingReferences] = useState(false)

  // Edit modal
  const [editModal, setEditModal] = useState<VideoFile | null>(null)
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    type: "online" as VideoType,
    aspectRatio: "landscape" as "landscape" | "portrait" | "square",
    kyDate: "",
    selectedGenres: [] as string[],
    // Movie
    studioId: "",
    releaseYear: "",
    runtime: "",
    // Trailer
    trailerTypeId: "",
    trailerNumber: "",
    forMovieId: "",
    forSeriesId: "",
    // Commercial
    brandId: "",
    productId: "",
    agencyId: "",
    adTypeId: "",
    campaign: "",
    airYear: "",
    // TV Show
    seriesId: "",
    seasonNum: "",
    episodeNum: "",
    episodeTitle: "",
    // Online
    creatorId: "",
    contentTypeId: "",
    // Platforms
    kempoTubeChannelId: "",
    flipFlopAccountId: "",
    tvChannelId: "",
  })
  const [saving, setSaving] = useState(false)
  const [editMessage, setEditMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Load video files and lookup data on mount
  useEffect(() => {
    reloadVideoFiles()
    loadLookupData()
  }, [])

  const loadLookupData = async () => {
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

      const results = await Promise.all([
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

      if (Array.isArray(results[0])) setGenres(results[0])
      if (Array.isArray(results[1])) setTrailerTypes(results[1])
      if (Array.isArray(results[2])) setAdTypes(results[2])
      if (Array.isArray(results[3])) setContentTypes(results[3])
      if (Array.isArray(results[4])) setSeriesList(results[4])
      if (Array.isArray(results[5])) setStudios(results[5])
      if (Array.isArray(results[6])) setBrands(results[6])
      if (Array.isArray(results[7])) setProducts(results[7])
      if (Array.isArray(results[8])) setPeople(results[8])
      if (Array.isArray(results[9])) setKempoTubeChannels(results[9])
      if (Array.isArray(results[10])) setFlipFlopAccounts(results[10])
      if (Array.isArray(results[11])) setTvChannels(results[11])
    } catch (err) {
      console.error("Failed to load lookup data:", err)
    }
  }

  const reloadVideoFiles = async () => {
    try {
      const res = await fetch("/api/video/list")
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideoFiles(data)
      }
    } catch (err) {
      console.error("Failed to load video files:", err)
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

  const openDeleteModal = async (url: string, name: string, id: string) => {
    setDeleteModal({ url, name, id })
    setDeleteConfirmText("")
    setReferences([])
    setLoadingReferences(true)

    try {
      const res = await fetch("/api/media/find-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mediaType: "video" }),
      })
      const data = await res.json()
      if (data.references) {
        setReferences(data.references)
      }
    } catch (err) {
      console.error("Failed to find references:", err)
    } finally {
      setLoadingReferences(false)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal(null)
    setDeleteConfirmText("")
    setReferences([])
  }

  const openEditModal = (file: VideoFile) => {
    setEditModal(file)
    setEditData({
      name: file.name,
      description: file.description || "",
      type: file.type,
      aspectRatio: (file.aspectRatio as "landscape" | "portrait" | "square") || "landscape",
      kyDate: file.kyDate ? file.kyDate.split("T")[0] : "",
      selectedGenres: file.genres.map((g) => g.genre.id),
      // Movie
      studioId: file.movieMetadata?.studio?.id || "",
      releaseYear: file.movieMetadata?.releaseYear?.toString() || "",
      runtime: file.movieMetadata?.runtime?.toString() || "",
      // Trailer
      trailerTypeId: file.trailerMetadata?.trailerType?.id || "",
      trailerNumber: file.trailerMetadata?.trailerNumber?.toString() || "",
      forMovieId: file.trailerMetadata?.forMovie?.id || "",
      forSeriesId: file.trailerMetadata?.forSeries?.id || "",
      // Commercial
      brandId: file.commercialMetadata?.brand?.id || "",
      productId: file.commercialMetadata?.product?.id || "",
      agencyId: file.commercialMetadata?.agency?.id || "",
      adTypeId: file.commercialMetadata?.adType?.id || "",
      campaign: file.commercialMetadata?.campaign || "",
      airYear: file.commercialMetadata?.airYear?.toString() || "",
      // TV Show
      seriesId: file.tvEpisodeMetadata?.series?.id || "",
      seasonNum: file.tvEpisodeMetadata?.seasonNum?.toString() || "",
      episodeNum: file.tvEpisodeMetadata?.episodeNum?.toString() || "",
      episodeTitle: file.tvEpisodeMetadata?.episodeTitle || "",
      // Online
      creatorId: file.onlineMetadata?.creator?.id || "",
      contentTypeId: file.onlineMetadata?.contentType?.id || "",
      // Platforms
      kempoTubeChannelId: file.kempoTubeVideo?.channel?.id || "",
      flipFlopAccountId: file.flipFlopVideo?.account?.id || "",
      tvChannelId: file.tvBroadcasts[0]?.tvChannel?.id || "",
    })
    setEditMessage(null)
  }

  const closeEditModal = () => {
    setEditModal(null)
    setEditMessage(null)
  }

  const handleGenreToggle = (genreId: string) => {
    setEditData((prev) => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter((g) => g !== genreId)
        : [...prev.selectedGenres, genreId],
    }))
  }

  const saveEdit = async () => {
    if (!editModal) return

    setSaving(true)
    setEditMessage(null)

    try {
      const body: Record<string, unknown> = {
        id: editModal.id,
        name: editData.name,
        description: editData.description,
        type: editData.type,
        aspectRatio: editData.aspectRatio,
        kyDate: editData.kyDate || null,
        genreIds: editData.selectedGenres,
      }

      // Type-specific metadata
      if (editData.type === "movie") {
        body.studioId = editData.studioId || null
        body.releaseYear = editData.releaseYear || null
        body.runtime = editData.runtime || null
      } else if (editData.type === "trailer") {
        body.trailerTypeId = editData.trailerTypeId
        body.trailerNumber = editData.trailerNumber || null
        body.forMovieId = editData.forMovieId || null
        body.forSeriesId = editData.forSeriesId || null
      } else if (editData.type === "commercial") {
        body.adTypeId = editData.adTypeId
        body.brandId = editData.brandId || null
        body.productId = editData.productId || null
        body.agencyId = editData.agencyId || null
        body.campaign = editData.campaign || null
        body.airYear = editData.airYear || null
      } else if (editData.type === "tvShow") {
        body.seriesId = editData.seriesId
        body.seasonNum = editData.seasonNum || null
        body.episodeNum = editData.episodeNum || null
        body.episodeTitle = editData.episodeTitle || null
      } else if (editData.type === "online") {
        body.contentTypeId = editData.contentTypeId
        body.creatorId = editData.creatorId || null
      }

      // Platform assignments
      if (editData.kempoTubeChannelId) {
        body.kempoTubeChannelId = editData.kempoTubeChannelId
      } else if (editModal.kempoTubeVideo) {
        body.removeKempoTube = true
      }

      if (editData.flipFlopAccountId) {
        body.flipFlopAccountId = editData.flipFlopAccountId
      } else if (editModal.flipFlopVideo) {
        body.removeFlipFlop = true
      }

      if (editData.tvChannelId) {
        body.tvChannelId = editData.tvChannelId
      } else if (editModal.tvBroadcasts.length > 0) {
        body.removeTv = true
      }

      const res = await fetch("/api/video/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Update failed")
      }

      setEditMessage({ type: "success", text: "Saved successfully!" })
      await reloadVideoFiles()

      setTimeout(() => {
        closeEditModal()
      }, 1000)
    } catch (error) {
      setEditMessage({ type: "error", text: error instanceof Error ? error.message : "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal || deleteConfirmText !== "DELETE") return

    setDeletingVideo(deleteModal.url)
    setLibraryMessage(null)

    try {
      if (references.length > 0) {
        await fetch("/api/media/remove-references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: deleteModal.url }),
        })
      }

      const res = await fetch("/api/video/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: deleteModal.url }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Delete failed")
      }

      const refMsg =
        references.length > 0 ? ` (${references.length} reference${references.length > 1 ? "s" : ""} removed)` : ""
      setLibraryMessage({ type: "success", text: `"${deleteModal.name}" deleted successfully${refMsg}` })
      await reloadVideoFiles()
      closeDeleteModal()

      setTimeout(() => setLibraryMessage(null), 3000)
    } catch (error) {
      setLibraryMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" })
    } finally {
      setDeletingVideo(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/world-data/video" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-green-600">Manage Video</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h2 className="text-lg font-semibold">Video Library ({filteredAndSortedVideoFiles.length})</h2>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as VideoType | "all")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                {Object.entries(videoTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as "name" | "createdAt" | "kyDate" | "type")}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="name">Alphabetical</option>
                <option value="createdAt">Upload Date</option>
                <option value="kyDate">Kempo Year</option>
                <option value="type">Type</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                title={sortDirection === "asc" ? "Ascending" : "Descending"}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {libraryMessage && (
            <div
              className={`mb-4 p-3 rounded ${
                libraryMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {libraryMessage.text}
            </div>
          )}

          {filteredAndSortedVideoFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">No video files found</p>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedVideoFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${videoTypeColors[file.type]}`}>
                        {videoTypeLabels[file.type]}
                      </span>
                      <p className="font-medium text-sm truncate">{file.name}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {file.duration &&
                        `${Math.floor(file.duration / 60)}:${Math.floor(file.duration % 60)
                          .toString()
                          .padStart(2, "0")}`}
                      {file.genres.length > 0 && ` · ${file.genres.map((g) => g.genre.name).join(", ")}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {file.kempoTubeVideo && (
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">KempoTube</span>
                      )}
                      {file.flipFlopVideo && (
                        <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">FlipFlop</span>
                      )}
                      {file.tvBroadcasts.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">TV</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button onClick={() => openEditModal(file)} className="text-green-600 hover:text-green-800 text-sm">
                      View/Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(file.url || "", file.name, file.id)}
                      disabled={deletingVideo === file.url}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                    >
                      {deletingVideo === file.url ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <strong>&quot;{deleteModal.name}&quot;</strong>? This will permanently
              remove both the database record and the blob file. This action cannot be undone.
            </p>

            {loadingReferences ? (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <p className="text-sm text-gray-600">Searching for references...</p>
              </div>
            ) : references.length > 0 ? (
              <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Found {references.length} reference{references.length > 1 ? "s" : ""} that will be removed:
                </p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {references.map((ref, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">{ref.type}</span>
                      <span>{ref.title}</span>
                      <span className="text-xs text-amber-600">({ref.field})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-700">No references found in articles or pages.</p>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-2">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Type DELETE"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirmText !== "DELETE" || deletingVideo === deleteModal.url}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingVideo === deleteModal.url ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">View/Edit Video</h3>

            {editMessage && (
              <div
                className={`mb-4 p-3 rounded ${
                  editMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {editMessage.text}
              </div>
            )}

            {/* Video Player */}
            {editModal.url && (
              <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-xs text-green-600 uppercase font-medium mb-2">Preview</p>
                <video controls className="w-full max-h-48 rounded" src={editModal.url}>
                  Your browser does not support the video element.
                </video>
              </div>
            )}

            <div className="space-y-4">
              {/* Read-only fields */}
              <div className="bg-gray-50 p-3 rounded border space-y-2">
                <p className="text-xs text-gray-500 uppercase font-medium">Read-only</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500">ID</label>
                    <p className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{editModal.id}</p>
                  </div>
                  {editModal.duration && (
                    <div>
                      <label className="block text-xs text-gray-500">Duration</label>
                      <p className="bg-gray-100 px-2 py-1 rounded">
                        {Math.floor(editModal.duration / 60)}:
                        {Math.floor(editModal.duration % 60).toString().padStart(2, "0")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value as VideoType })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kempo Date (k.y.)</label>
                  <input
                    type="date"
                    value={editData.kyDate}
                    onChange={(e) => setEditData({ ...editData, kyDate: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* Genres (for movie/tvShow) */}
              {(editData.type === "movie" || editData.type === "tvShow") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genres</label>
                  <div className="flex flex-wrap gap-1">
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => handleGenreToggle(genre.id)}
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          editData.selectedGenres.includes(genre.id)
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

              {/* Type-specific fields */}
              {editData.type === "movie" && (
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <p className="text-xs text-purple-600 uppercase font-medium mb-2">Movie Details</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Studio</label>
                      <select
                        value={editData.studioId}
                        onChange={(e) => setEditData({ ...editData, studioId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- None --</option>
                        {studios.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Release Year</label>
                      <input
                        type="number"
                        value={editData.releaseYear}
                        onChange={(e) => setEditData({ ...editData, releaseYear: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="1948"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Runtime (min)</label>
                      <input
                        type="number"
                        value={editData.runtime}
                        onChange={(e) => setEditData({ ...editData, runtime: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editData.type === "trailer" && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-2">Trailer Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Trailer Type</label>
                      <select
                        value={editData.trailerTypeId}
                        onChange={(e) => setEditData({ ...editData, trailerTypeId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- Select --</option>
                        {trailerTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Trailer #</label>
                      <input
                        type="number"
                        value={editData.trailerNumber}
                        onChange={(e) => setEditData({ ...editData, trailerNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">For Series</label>
                      <select
                        value={editData.forSeriesId}
                        onChange={(e) => setEditData({ ...editData, forSeriesId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- None --</option>
                        {seriesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {editData.type === "commercial" && (
                <div className="bg-amber-50 p-3 rounded border border-amber-200">
                  <p className="text-xs text-amber-600 uppercase font-medium mb-2">Commercial Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Ad Type</label>
                      <select
                        value={editData.adTypeId}
                        onChange={(e) => setEditData({ ...editData, adTypeId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- Select --</option>
                        {adTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Brand</label>
                      <select
                        value={editData.brandId}
                        onChange={(e) => setEditData({ ...editData, brandId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- None --</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Product</label>
                      <select
                        value={editData.productId}
                        onChange={(e) => setEditData({ ...editData, productId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- None --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Air Year</label>
                      <input
                        type="number"
                        value={editData.airYear}
                        onChange={(e) => setEditData({ ...editData, airYear: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="1948"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editData.type === "tvShow" && (
                <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                  <p className="text-xs text-indigo-600 uppercase font-medium mb-2">TV Episode Details</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Series</label>
                      <select
                        value={editData.seriesId}
                        onChange={(e) => setEditData({ ...editData, seriesId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- Select --</option>
                        {seriesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Season</label>
                      <input
                        type="number"
                        value={editData.seasonNum}
                        onChange={(e) => setEditData({ ...editData, seasonNum: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Episode</label>
                      <input
                        type="number"
                        value={editData.episodeNum}
                        onChange={(e) => setEditData({ ...editData, episodeNum: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs text-gray-600 mb-1">Episode Title</label>
                      <input
                        type="text"
                        value={editData.episodeTitle}
                        onChange={(e) => setEditData({ ...editData, episodeTitle: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editData.type === "online" && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-xs text-green-600 uppercase font-medium mb-2">Online Video Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Content Type</label>
                      <select
                        value={editData.contentTypeId}
                        onChange={(e) => setEditData({ ...editData, contentTypeId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- Select --</option>
                        {contentTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Creator</label>
                      <select
                        value={editData.creatorId}
                        onChange={(e) => setEditData({ ...editData, creatorId: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">-- None --</option>
                        {people.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.stageName || `${p.firstName} ${p.lastName}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Cast/Crew (VideoElements) */}
              {editModal.elements.length > 0 && (
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">
                    Cast & Crew ({editModal.elements.length})
                  </p>
                  <div className="space-y-1">
                    {editModal.elements.map((el) => (
                      <div key={el.id} className="flex items-center gap-2 text-sm">
                        <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded capitalize">{el.role}</span>
                        <span>
                          {el.person.stageName || `${el.person.firstName} ${el.person.lastName}`}
                        </span>
                        {el.credit && <span className="text-gray-500 text-xs">({el.credit})</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Manage cast/crew via the VideoElements API
                  </p>
                </div>
              )}

              {/* Platform Assignments */}
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Platform Publishing</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">KempoTube Channel</label>
                    <select
                      value={editData.kempoTubeChannelId}
                      onChange={(e) => setEditData({ ...editData, kempoTubeChannelId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">-- Not on KempoTube --</option>
                      {kempoTubeChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">FlipFlop Account</label>
                    <select
                      value={editData.flipFlopAccountId}
                      onChange={(e) => setEditData({ ...editData, flipFlopAccountId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">-- Not on FlipFlop --</option>
                      {flipFlopAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">TV Channel</label>
                    <select
                      value={editData.tvChannelId}
                      onChange={(e) => setEditData({ ...editData, tvChannelId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">-- Not on TV --</option>
                      {tvChannels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.name} {ch.callSign ? `(${ch.callSign})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
