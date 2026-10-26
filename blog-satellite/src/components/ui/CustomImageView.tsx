"use client"

import { NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlignLeft, AlignCenter, AlignRight, GripVertical, Trash2 } from 'lucide-react'
import { useResizeDrag } from '@/hooks/use-resize-drag'

const SIZE_PRESETS = ['25%', '50%', '75%', '100%']

export default function CustomImageView({ node, updateAttributes, selected, deleteNode, editor }: any) {
    const { src, alt, width, align } = node.attrs

    const [editAlt, setEditAlt] = useState(alt)
    const [editAlign, setEditAlign] = useState(align)
    const [open, setOpen] = useState(false)
    const { livePercent, startResize } = useResizeDrag()
    const currentWidth = livePercent !== null ? `${livePercent}%` : width

    const handleSave = () => {
        updateAttributes({ alt: editAlt, align: editAlign })
        setOpen(false)
    }

    const resizeFrom = (direction: 1 | -1) => (e: React.PointerEvent<HTMLElement>) => {
        const frame = e.currentTarget.parentElement
        const container = e.currentTarget.closest<HTMLElement>('[data-type="customImage"]')
        if (frame && container) startResize(e, {
            image: frame, container, direction, symmetric: align === 'center',
            onCommit: (newWidth) => updateAttributes({ width: newWidth }),
        })
    }

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
            {editor.isEditable ? (
                // ── MODE ÉDITION : Popover + drag handle + resize + badge ALT ──
                <Popover open={open} onOpenChange={(isOpen) => {
                    if (livePercent !== null) return
                    setOpen(isOpen)
                    if (isOpen) {
                        setEditAlt(alt)
                        setEditAlign(align)
                    }
                }}>
                    <PopoverTrigger asChild>
                        <div className="group" style={{ display: 'inline-block', position: 'relative', width: currentWidth, maxWidth: '100%', verticalAlign: 'top' }}>
                            {/* Repère visuel : toute l'image se glisse pour la déplacer dans le texte */}
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
                                    outline: selected || livePercent !== null ? '2px solid #3b82f6' : 'none',
                                    cursor: 'grab',
                                    display: 'block',
                                }}
                                draggable={false}
                            />

                            {/* Poignées de redimensionnement (gauche et droite), visibles au survol */}
                            {([-1, 1] as const).map((direction) => (
                                <div
                                    key={direction}
                                    onPointerDown={resizeFrom(direction)}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`absolute top-1/2 -translate-y-1/2 h-12 w-2 rounded-full bg-blue-500 border border-white shadow cursor-ew-resize touch-none transition-opacity ${selected || livePercent !== null ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    style={direction === 1 ? { right: -4 } : { left: -4 }}
                                />
                            ))}

                            {livePercent !== null && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                                    {livePercent}%
                                </div>
                            )}

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

                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Taille</label>
                            <div className="flex gap-2">
                                {SIZE_PRESETS.map((preset) => (
                                    <Button
                                        key={preset}
                                        type="button"
                                        size="sm"
                                        variant={width === preset ? 'default' : 'outline'}
                                        onClick={() => updateAttributes({ width: preset })}
                                    >
                                        {preset}
                                    </Button>
                                ))}
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
                    }}
                />
            )}
            
        </NodeViewWrapper>
    )
}
