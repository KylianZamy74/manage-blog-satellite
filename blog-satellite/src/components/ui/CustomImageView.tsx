"use client"

import { NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, GripVertical, Trash2 } from 'lucide-react'
import { useResizeDrag } from '@/hooks/use-resize-drag'
import { useBlockDrag } from '@/hooks/use-block-drag'

// Resize handles like a window: 4 corners + left/right edges ([dirX, dirY, position classes, cursor])
const HANDLES: [1 | -1 | 0, 1 | -1 | 0, string, string][] = [
    [-1, -1, '-top-1.5 -left-1.5', 'cursor-nwse-resize'],
    [1, -1, '-top-1.5 -right-1.5', 'cursor-nesw-resize'],
    [-1, 1, '-bottom-1.5 -left-1.5', 'cursor-nesw-resize'],
    [1, 1, '-bottom-1.5 -right-1.5', 'cursor-nwse-resize'],
    [-1, 0, 'top-1/2 -translate-y-1/2 -left-1 h-10 w-2', 'cursor-ew-resize'],
    [1, 0, 'top-1/2 -translate-y-1/2 -right-1 h-10 w-2', 'cursor-ew-resize'],
]

export default function CustomImageView({ node, updateAttributes, selected, deleteNode, editor, getPos }: any) {
    const { src, alt, width, align, offset } = node.attrs

    const [editAlt, setEditAlt] = useState(alt)
    const [editAlign, setEditAlign] = useState(align)
    const [open, setOpen] = useState(false)
    const { resizing, startResize } = useResizeDrag()
    const { startDrag, dragging, overlay } = useBlockDrag(editor, getPos)

    const handleSave = () => {
        updateAttributes({ alt: editAlt, align: editAlign, offset: editAlign === align ? offset : null })
        setOpen(false)
    }

    const resizeFrom = (dirX: 1 | -1 | 0, dirY: 1 | -1 | 0) => (e: React.PointerEvent<HTMLElement>) => {
        const frame = e.currentTarget.parentElement
        const container = e.currentTarget.closest<HTMLElement>('[data-type="customImage"]')
        if (frame && container) startResize(e, {
            frame, container, dirX, dirY, symmetric: align === 'center',
            onCommit: (newWidth) => updateAttributes({ width: newWidth }),
        })
    }

    return (
        <NodeViewWrapper
            data-type="customImage"
            style={{
                textAlign: align as React.CSSProperties['textAlign'],
                margin: '16px 0',
                position: 'relative',
            }}
        >
            {editor.isEditable ? (
                // ── MODE ÉDITION : Popover + drag handle + resize + badge ALT ──
                <Popover open={open} onOpenChange={(isOpen) => {
                    if (resizing) return
                    setOpen(isOpen)
                    if (isOpen) {
                        setEditAlt(alt)
                        setEditAlign(align)
                    }
                }}>
                    <PopoverTrigger asChild>
                        <div
                            className="group"
                            onPointerDown={(e) => { e.preventDefault(); startDrag(e) }}
                            style={{ display: 'inline-block', position: 'relative', width, maxWidth: '100%', verticalAlign: 'top', marginLeft: offset ?? undefined, opacity: dragging ? 0.4 : 1 }}
                        >
                            {/* Repère visuel : glisser l'image pour la placer (gauche / centre / droite, entre deux paragraphes) */}
                            <div
                                className={selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 4,
                                    background: 'rgba(0,0,0,0.5)',
                                    borderRadius: '4px',
                                    padding: '2px',
                                    pointerEvents: 'none',
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
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    outline: selected || resizing ? '2px solid #3b82f6' : 'none',
                                    cursor: 'grab',
                                    display: 'block',
                                }}
                                draggable={false}
                            />

                            {/* Poignées de redimensionnement (coins et bords), visibles au survol */}
                            {HANDLES.map(([dirX, dirY, position, cursor]) => (
                                <div
                                    key={`${dirX}${dirY}`}
                                    onPointerDown={resizeFrom(dirX, dirY)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`absolute z-10 ${position} ${cursor} ${dirY ? 'h-3 w-3' : ''} rounded-full bg-white border-2 border-blue-500 shadow touch-none transition-opacity ${selected || resizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                />
                            ))}

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
            ) : (
                // ── MODE PREVIEW : juste l'image, propre, rien d'autre ──
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: width,
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        display: 'inline-block',
                        marginLeft: offset ?? undefined,
                    }}
                />
            )}
            
            {overlay}
        </NodeViewWrapper>
    )
}
