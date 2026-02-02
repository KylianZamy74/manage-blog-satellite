"use client"

import { NodeViewWrapper } from '@tiptap/react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CldUploadWidget } from 'next-cloudinary'
import { Plus, Trash2, GripVertical, ImageIcon, X } from 'lucide-react'

interface GalleryImage {
    src: string
    alt: string
    width?: string
}

export default function ImageGalleryView({ node, updateAttributes, selected, deleteNode }: any) {
    const images: GalleryImage[] = node.attrs.images || []
    const columns: number = node.attrs.columns || 3
    const gap: number = node.attrs.gap || 8

    const imagesRef = useRef<GalleryImage[]>(images)
    useEffect(() => {
        imagesRef.current = node.attrs.images || []
    }, [node.attrs.images])

    const [editColumns, setEditColumns] = useState(columns)
    const [editGap, setEditGap] = useState(gap)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null)
    const [editAlt, setEditAlt] = useState('')
    const [resizingIndex, setResizingIndex] = useState<number | null>(null)

    const handleAddImage = useCallback((url: string) => {
        const current = imagesRef.current
        const newImages = [...current, { src: url, alt: '', width: '100%' }]
        updateAttributes({ images: JSON.parse(JSON.stringify(newImages)) })
    }, [updateAttributes])

    const handleRemoveImage = (index: number) => {
        const current = imagesRef.current
        const newImages = current.filter((_: GalleryImage, i: number) => i !== index)
        updateAttributes({ images: JSON.parse(JSON.stringify(newImages)) })
    }

    const handleSaveAlt = (index: number) => {
        const current = imagesRef.current
        const newImages = [...current]
        newImages[index] = { ...newImages[index], alt: editAlt }
        updateAttributes({ images: JSON.parse(JSON.stringify(newImages)) })
        setEditingAltIndex(null)
    }

    const handleSaveSettings = () => {
        updateAttributes({ columns: editColumns, gap: editGap })
        setSettingsOpen(false)
    }

    const handleResizeStart = useCallback((e: React.MouseEvent, index: number) => {
        e.preventDefault()
        e.stopPropagation()
        setResizingIndex(index)

        const startX = e.clientX
        const img = (e.currentTarget as HTMLElement).parentElement?.querySelector('img')
        if (!img) return
        const startWidth = img.offsetWidth

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const diff = moveEvent.clientX - startX
            const newWidth = Math.max(50, startWidth + diff)
            const current = imagesRef.current
            const newImages = [...current]
            newImages[index] = { ...newImages[index], width: `${newWidth}px` }
            updateAttributes({ images: JSON.parse(JSON.stringify(newImages)) })
        }

        const handleMouseUp = () => {
            setResizingIndex(null)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [updateAttributes])

    return (
        <NodeViewWrapper
            draggable
            data-type="imageGallery"
            style={{ margin: '16px 0', position: 'relative' }}
        >
            <div
                data-drag-handle
                style={{
                    position: 'absolute',
                    top: -12,
                    left: 0,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '4px',
                    padding: '2px',
                    cursor: 'grab',
                    opacity: selected ? 1 : 0,
                    transition: 'opacity 0.2s',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <GripVertical style={{ width: 16, height: 16, color: 'white' }} />
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: `${gap}px`,
                    border: selected ? '2px solid #3b82f6' : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '4px',
                    transition: 'border-color 0.2s',
                    alignItems: 'start',
                }}
            >
                {images.map((img: GalleryImage, index: number) => (
                    <div key={`${img.src}-${index}`} style={{ position: 'relative' }}>
                        <img
                            src={img.src}
                            alt={img.alt}
                            style={{
                                width: img.width || '100%',
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                display: 'block',
                            }}
                            draggable={false}
                        />

                        {selected && (
                            <>
                                <button
                                    onClick={() => handleRemoveImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        background: '#ef4444',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X style={{ width: 14, height: 14, color: 'white' }} />
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingAltIndex(index)
                                        setEditAlt(img.alt)
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: 4,
                                        left: 4,
                                        background: img.alt ? 'rgba(0,0,0,0.6)' : '#ef4444',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '2px 6px',
                                        fontSize: '10px',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {img.alt ? 'ALT' : 'ALT manquant'}
                                </button>

                                <div
                                    onMouseDown={(e) => handleResizeStart(e, index)}
                                    style={{
                                        position: 'absolute',
                                        bottom: 4,
                                        right: 4,
                                        width: 16,
                                        height: 16,
                                        background: '#3b82f6',
                                        borderRadius: '2px',
                                        cursor: 'nwse-resize',
                                        opacity: resizingIndex === index ? 1 : 0.7,
                                        transition: 'opacity 0.2s',
                                    }}
                                />
                            </>
                        )}

                        {editingAltIndex === index && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 30,
                                    left: 4,
                                    right: 4,
                                    background: 'white',
                                    borderRadius: '6px',
                                    padding: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    zIndex: 20,
                                }}
                            >
                                <Input
                                    value={editAlt}
                                    onChange={(e) => setEditAlt(e.target.value)}
                                    placeholder="Description de l'image..."
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveAlt(index)
                                        if (e.key === 'Escape') setEditingAltIndex(null)
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                                    <Button size="sm" className="flex-1" onClick={() => handleSaveAlt(index)}>
                                        OK
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingAltIndex(null)}>
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                <CldUploadWidget
                    uploadPreset="blog_images"
                    onSuccess={(result) => {
                        if (typeof result.info === 'object' && result.info.secure_url) {
                            handleAddImage(result.info.secure_url)
                        }
                    }}
                >
                    {({ open }) => (
                        <div
                            onClick={() => open()}
                            style={{
                                minHeight: '120px',
                                border: '2px dashed #d1d5db',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                gap: '8px',
                                color: '#9ca3af',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                        >
                            <Plus style={{ width: 24, height: 24 }} />
                            <span style={{ fontSize: '12px' }}>Ajouter</span>
                        </div>
                    )}
                </CldUploadWidget>
            </div>

            {selected && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                    <Popover open={settingsOpen} onOpenChange={(isOpen) => {
                        setSettingsOpen(isOpen)
                        if (isOpen) {
                            setEditColumns(columns)
                            setEditGap(gap)
                        }
                    }}>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                                <ImageIcon className="h-4 w-4 mr-1" />
                                {columns} colonnes
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 space-y-3 bg-white dark:bg-zinc-900">
                            <p className="font-semibold text-sm">Paramètres galerie</p>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Colonnes</label>
                                <div className="flex gap-2">
                                    {[2, 3, 4, 5].map((n) => (
                                        <Button
                                            key={n}
                                            type="button"
                                            size="sm"
                                            variant={editColumns === n ? 'default' : 'outline'}
                                            onClick={() => setEditColumns(n)}
                                        >
                                            {n}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Espacement ({editGap}px)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={editGap}
                                    onChange={(e) => setEditGap(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <Button type="button" className="w-full" onClick={handleSaveSettings}>
                                Appliquer
                            </Button>
                        </PopoverContent>
                    </Popover>

                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNode()}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer galerie
                    </Button>
                </div>
            )}
        </NodeViewWrapper>
    )
}
