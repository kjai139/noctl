

export interface GlossaryItem {
    term:string,
    definition:string,
    term_type: 'term' | 'name' | 'skill'
}


export type GlossaryType = GlossaryItem[]


export type LanguagesType = 'English' | 'Chinese' | 'Korean' | 'Japanese'


export type ModelsType = 'Standard' | 'Better-1' | 'Test-1' | 'Duo'