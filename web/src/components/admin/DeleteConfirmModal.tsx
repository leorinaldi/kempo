"use client"

import { useState } from "react"

interface Reference {
  type: string
  title: string
  field: string
}

interface DeleteConfirmModalProps {
  isOpen: boolean
  itemName: string
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  warningMessage?: string
  references?: Reference[]
  loadingReferences?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  itemName,
  onClose,
  onConfirm,
  isDeleting,
  warningMessage,
  references = [],
  loadingReferences = false,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("")

  if (!isOpen) return null

  const handleClose = () => {
    setConfirmText("")
    onClose()
  }

  const handleConfirm = async () => {
    if (confirmText !== "DELETE") return
    await onConfirm()
    setConfirmText("")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Delete</h3>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete <strong>&quot;{itemName}&quot;</strong>?
          {warningMessage && (
            <span className="text-red-600"> {warningMessage}</span>
          )}
          {!warningMessage && " This action cannot be undone."}
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
                  <span className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                    {ref.type}
                  </span>
                  <span>{ref.title}</span>
                  <span className="text-xs text-amber-600">({ref.field})</span>
                </li>
              ))}
            </ul>
          </div>
        ) : references !== undefined && !loadingReferences ? (
          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-700">No references found in articles or pages.</p>
          </div>
        ) : null}

        <p className="text-sm text-gray-600 mb-2">
          Type <strong>DELETE</strong> to confirm:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          placeholder="Type DELETE"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== "DELETE" || isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
