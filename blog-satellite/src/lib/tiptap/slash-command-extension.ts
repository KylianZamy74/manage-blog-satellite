import { Extension, type Editor, type Range } from '@tiptap/core'
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion'

export interface SlashItem {
    title: string
    keywords: string
    run: (editor: Editor) => void
}

export interface SlashCommandOptions {
    items: SlashItem[]
    render: SuggestionOptions<SlashItem>['render']
}

// "/" at the start of a word opens a block menu; the menu UI itself is rendered by the editor component
export const SlashCommand = Extension.create<SlashCommandOptions>({
    name: 'slashCommand',

    addOptions() {
        return { items: [], render: undefined }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion<SlashItem>({
                editor: this.editor,
                char: '/',
                items: ({ query }) => {
                    const q = query.toLowerCase()
                    return this.options.items.filter((item) => `${item.title} ${item.keywords}`.toLowerCase().includes(q))
                },
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashItem }) => {
                    editor.chain().focus().deleteRange(range).run()
                    props.run(editor)
                },
                render: this.options.render,
            }),
        ]
    },
})
