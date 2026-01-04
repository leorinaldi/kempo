"use client"

import { useState, useEffect } from "react"
import { useAdminAuth, AdminPageLayout, MessageBanner } from "@/components/admin"

interface KempoTubeChannel {
  id: string
  name: string
  _count: { videos: number }
}

interface Person {
  id: string
  firstName: string
  lastName: string
  stageName: string | null
}

interface FlipFlopAccount {
  id: string
  name: string
  person: Person | null
  _count: { videos: number }
}

interface TvChannel {
  id: string
  name: string
  callSign: string | null
  _count: { broadcasts: number }
}

type ChannelType = "kempotube" | "flipflop" | "tv"

export default function ChannelsPage() {
  const { isLoading: authLoading } = useAdminAuth()

  const [kempoTubeChannels, setKempoTubeChannels] = useState<KempoTubeChannel[]>([])
  const [flipFlopAccounts, setFlipFlopAccounts] = useState<FlipFlopAccount[]>([])
  const [tvChannels, setTvChannels] = useState<TvChannel[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Create modal
  const [createModal, setCreateModal] = useState<ChannelType | null>(null)
  const [createData, setCreateData] = useState({
    name: "",
    callSign: "",
    personId: "",
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [kempoTubeRes, flipFlopRes, tvRes, peopleRes] = await Promise.all([
        fetch("/api/kempotube-channels"),
        fetch("/api/flipflop-accounts"),
        fetch("/api/tv-channels"),
        fetch("/api/entities/people"),
      ])

      const [kempoTubeData, flipFlopData, tvData, peopleData] = await Promise.all([
        kempoTubeRes.json(),
        flipFlopRes.json(),
        tvRes.json(),
        peopleRes.json(),
      ])

      if (Array.isArray(kempoTubeData)) setKempoTubeChannels(kempoTubeData)
      if (Array.isArray(flipFlopData)) setFlipFlopAccounts(flipFlopData)
      if (Array.isArray(tvData)) setTvChannels(tvData)
      if (Array.isArray(peopleData)) setPeople(peopleData)
    } catch (err) {
      console.error("Failed to load data:", err)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const openCreateModal = (type: ChannelType) => {
    setCreateModal(type)
    setCreateData({ name: "", callSign: "", personId: "" })
  }

  const closeCreateModal = () => {
    setCreateModal(null)
    setCreateData({ name: "", callSign: "", personId: "" })
  }

  const handleCreate = async () => {
    if (!createModal || !createData.name) return

    setCreating(true)

    try {
      let endpoint = ""
      let body: Record<string, unknown> = { name: createData.name }

      if (createModal === "kempotube") {
        endpoint = "/api/kempotube-channels"
      } else if (createModal === "flipflop") {
        endpoint = "/api/flipflop-accounts"
        if (createData.personId) body.personId = createData.personId
      } else if (createModal === "tv") {
        endpoint = "/api/tv-channels"
        if (createData.callSign) body.callSign = createData.callSign
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create")
      }

      setMessage({ type: "success", text: `Created "${createData.name}" successfully!` })
      await loadData()
      closeCreateModal()

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to create" })
    } finally {
      setCreating(false)
    }
  }

  const getModalTitle = () => {
    if (createModal === "kempotube") return "New KempoTube Channel"
    if (createModal === "flipflop") return "New FlipFlop Account"
    if (createModal === "tv") return "New TV Channel"
    return ""
  }

  return (
    <AdminPageLayout title="Manage Channels" backHref="/admin/world-data/video" color="green">
      <MessageBanner message={message} className="mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KempoTube Channels */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-red-600">KempoTube Channels</h2>
            <button
              onClick={() => openCreateModal("kempotube")}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              + Add
            </button>
          </div>
          {kempoTubeChannels.length === 0 ? (
            <p className="text-gray-500 text-sm">No channels</p>
          ) : (
            <div className="space-y-2">
              {kempoTubeChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="p-2 bg-red-50 rounded border border-red-200"
                >
                  <p className="font-medium text-sm">{channel.name}</p>
                  <p className="text-xs text-gray-500">{channel._count.videos} videos</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FlipFlop Accounts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-pink-600">FlipFlop Accounts</h2>
            <button
              onClick={() => openCreateModal("flipflop")}
              className="text-sm bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded"
            >
              + Add
            </button>
          </div>
          {flipFlopAccounts.length === 0 ? (
            <p className="text-gray-500 text-sm">No accounts</p>
          ) : (
            <div className="space-y-2">
              {flipFlopAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-2 bg-pink-50 rounded border border-pink-200"
                >
                  <p className="font-medium text-sm">{account.name}</p>
                  <p className="text-xs text-gray-500">
                    {account.person
                      ? account.person.stageName || `${account.person.firstName} ${account.person.lastName}`
                      : "No linked person"}
                    {" · "}
                    {account._count.videos} videos
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TV Channels */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-600">TV Channels</h2>
            <button
              onClick={() => openCreateModal("tv")}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              + Add
            </button>
          </div>
          {tvChannels.length === 0 ? (
            <p className="text-gray-500 text-sm">No channels</p>
          ) : (
            <div className="space-y-2">
              {tvChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="p-2 bg-blue-50 rounded border border-blue-200"
                >
                  <p className="font-medium text-sm">
                    {channel.name}
                    {channel.callSign && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {channel.callSign}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{channel._count.broadcasts} broadcasts</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">{getModalTitle()}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder={
                    createModal === "kempotube"
                      ? "e.g., Pacific Pictures"
                      : createModal === "flipflop"
                      ? "e.g., @pacificpics"
                      : "e.g., Kempo Broadcasting Company"
                  }
                  autoFocus
                />
              </div>

              {createModal === "tv" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Sign</label>
                  <input
                    type="text"
                    value={createData.callSign}
                    onChange={(e) => setCreateData({ ...createData, callSign: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., KBC"
                  />
                </div>
              )}

              {createModal === "flipflop" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Person</label>
                  <select
                    value={createData.personId}
                    onChange={(e) => setCreateData({ ...createData, personId: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">-- No person linked --</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.stageName || `${person.firstName} ${person.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeCreateModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !createData.name}
                className={`flex-1 text-white font-medium py-2 px-4 rounded disabled:opacity-50 ${
                  createModal === "kempotube"
                    ? "bg-red-600 hover:bg-red-700"
                    : createModal === "flipflop"
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  )
}
