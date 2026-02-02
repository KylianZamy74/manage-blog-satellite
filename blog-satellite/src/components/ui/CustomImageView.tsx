"use client"

import { NodeViewWrapper } from '@tiptap/react'
import { useState, useCallback } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, GripVertical, Trash2 } from 'lucide-react'

export default function CustomImageView({ node, updateAttributes, selected, deleteNode }: any) {
    const { src, alt, width, align } = node.attrs

    const [editAlt, setEditAlt] = useState(alt)
    const [editAlign, setEditAlign] = useState(align)
    const [open, setOpen] = useState(false)
    const [isResizing, setIsResizing] = useState(false)

    const handleSave = () => {
        updateAttributes({ alt: editAlt, align: editAlign })
        setOpen(false)
    }

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)

        const startX = e.clientX
        const img = (e.currentTarget as HTMLElement).parentElement?.querySelector('img')
        if (!img) return
        const startWidth = img.offsetWidth

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const diff = moveEvent.clientX - startX
            const newWidth = Math.max(100, startWidth + diff)
            updateAttributes({ width: `${newWidth}px` })
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [updateAttributes])

    return (
        <NodeViewWrapper
            draggable
            data-type="customImage"
            style={{
                textAlign: align as React.CSSProperties['textAlign'],
                margin: '16px 0',
                position: 'relative',
            }}
        >
            <Popover open={open} onOpenChange={(isOpen) => {
                if (isResizing) return
                setOpen(isOpen)
                if (isOpen) {
                    setEditAlt(alt)
                    setEditAlign(align)
                }
            }}>
                <PopoverTrigger asChild>
                    <div style={{ display: 'inline-block', position: 'relative' }}>
                        <div
                            data-drag-handle
                            style={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
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

                        <img
                            src={src}
                            alt={alt}
                            style={{
                                width: width,
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                outline: selected ? '2px solid #3b82f6' : 'none',
                                cursor: 'pointer',
                                display: 'block',
                            }}
                            draggable={false}
                        />

                        <div
                            onMouseDown={handleResizeStart}
                            style={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                width: 16,
                                height: 16,
                                background: '#3b82f6',
                                borderRadius: '2px',
                                cursor: 'nwse-resize',
                                opacity: selected ? 1 : 0,
                                transition: 'opacity 0.2s',
                            }}
                        />

                        {!alt && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    background: '#ef4444',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            >
                                ALT manquant
                            </div>
                        )}
                    </div>
                </PopoverTrigger>

                <PopoverContent className="w-80 space-y-3 bg-white dark:bg-zinc-900">
                    <p className="font-semibold text-sm">Configurer l&apos;image</p>

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                            Texte alternatif (SEO)
                        </label>
                        <Input
                            value={editAlt}
                            onChange={(e) => setEditAlt(e.target.value)}
                            placeholder="Description de l'image..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Décris l&apos;image pour Google et les lecteurs d&apos;écran
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Alignement</label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={editAlign === 'left' ? 'default' : 'outline'}
                                onClick={() => setEditAlign('left')}
                            >
                                <AlignLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={editAlign === 'center' ? 'default' : 'outline'}
                                onClick={() => setEditAlign('center')}
                            >
                                <AlignCenter className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={editAlign === 'right' ? 'default' : 'outline'}
                                onClick={() => setEditAlign('right')}
                            >
                                <AlignRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="button" className="flex-1" onClick={handleSave}>
                            Appliquer
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteNode()}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </NodeViewWrapper>
    )
}
