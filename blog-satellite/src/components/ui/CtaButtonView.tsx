"use client"

import { NodeViewWrapper } from "@tiptap/react"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TextAlign from "@tiptap/extension-text-align"
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react"

export default function CtaButtonView({ node, updateAttributes }: any) {
    const { href, text, variant, color, align } = node.attrs

    const [editText, setEditText] = useState(text)
    const [editHref, setEditHref] = useState(href)
    const [editColor, setEditColor] = useState(color)
    const [editVariant, setEditVariant] = useState(variant)
    const [editAlign, setEditAlign] = useState(align)
    const [open, setOpen] = useState(false)

    const handleSave = () => {
          updateAttributes({
              text: editText,
              href: editHref,
              color: editColor,
              variant: editVariant,
              align: editAlign
          })
          setOpen(false)
      }

       const baseStyles: React.CSSProperties = {
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '16px',
          textDecoration: 'none',
          textAlign: 'center',
          cursor: 'pointer',
      }

         const variantStyles: React.CSSProperties = editVariant === 'primary'
          ? { backgroundColor: editColor, color: 'white', border: `2px solid ${editColor}` }
          : { backgroundColor: 'transparent', color: editColor, border: `2px solid ${editColor}` }

          return(
            <NodeViewWrapper className="cta-node-wrapper" style={{ margin: '16px 0', textAlign: editAlign }}>
              <Popover open={open} onOpenChange={(isOpen) => {
                  setOpen(isOpen)
                 
                  if (isOpen) {
                      setEditText(text)
                      setEditHref(href)
                      setEditColor(color)
                      setEditVariant(variant)
                      setEditAlign(align)
                  }
              }}>
                  <PopoverTrigger asChild>
                      {/* Le CTA tel qu'il apparaît — cliquer dessus ouvre le popover */}
                      <span style={{ ...baseStyles, ...variantStyles }}>
                          {editText}
                      </span>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 space-y-4 bg-white dark:bg-zinc-900">
                      <p className="font-semibold text-sm">Configurer le CTA</p>

                      <div className="flex gap-2 justify-center w-full">
                         <Button
                                  type="button"
                                  size="sm"
                                  variant={editAlign === 'left' ? 'default' : 'outline'}
                                  onClick={() => setEditAlign('left')}
                              >
                                  <AlignLeft/>
                            </Button>
                            <Button
                                  type="button"
                                  size="sm"
                                  variant={editAlign === 'center' ? 'default' : 'outline'}
                                  onClick={() => setEditAlign('center')}
                              >
                                  <AlignCenter/>
                              </Button>
                              <Button
                                  type="button"
                                  size="sm"
                                  variant={editAlign === 'right' ? 'default' : 'outline'}
                                  onClick={() => setEditAlign('right')}
                              >
                                  <AlignRight/>
                              </Button>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Texte du bouton</label>
                          <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              placeholder="Ex: Réserver maintenant"
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">URL de destination</label>
                          <Input
                              value={editHref}
                              onChange={(e) => setEditHref(e.target.value)}
                              placeholder="https://..."
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Couleur</label>
                          <div className="flex items-center gap-2">
                              <input
                                  type="color"
                                  value={editColor}
                                  onChange={(e) => setEditColor(e.target.value)}
                                  className="w-10 h-10 rounded cursor-pointer border-0"
                              />
                              <span className="text-xs text-muted-foreground">{editColor}</span>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Variante</label>
                          <div className="flex gap-2">
                              <Button
                                  type="button"
                                  size="sm"
                                  variant={editVariant === 'primary' ? 'default' : 'outline'}
                                  onClick={() => setEditVariant('primary')}
                              >
                                  Primary
                              </Button>
                              <Button
                                  type="button"
                                  size="sm"
                                  variant={editVariant === 'secondary' ? 'default' : 'outline'}
                                  onClick={() => setEditVariant('secondary')}
                              >
                                  Secondary
                              </Button>
                          </div>
                      </div>

                      <Button type="button" className="w-full my-2" onClick={handleSave}>
                          Appliquer
                      </Button>
                  </PopoverContent>
              </Popover>
          </NodeViewWrapper>
          )
}