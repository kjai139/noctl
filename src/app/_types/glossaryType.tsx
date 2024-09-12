

export interface GlossaryItem {
    term:string,
    definition:string
}


export type GlossaryType = GlossaryItem[]


export type LanguagesType = 'English' | 'Chinese' | 'Korean' | 'Japanese'


export type ModelsType = 'Standard' | 'Alt-1'