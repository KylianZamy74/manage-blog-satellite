"use client"

import { useState } from "react"

interface ConfirmModalProps {
    title: string
    message: string
    confirmLabel: string
    confirmClassName: string
    onConfirm: () => Promise<void>
    onCancel: () => void
}

export default function ConfirmModal({ title, message, confirmLabel, confirmClassName, onConfirm, onCancel }: ConfirmModalProps) {

    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        await onConfirm()
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
            <div
                className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${confirmClassName}`}
                    >
                        {loading ? "..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
