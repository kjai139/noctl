

export interface GlossaryItem {
    term:string,
    translated_term:string,
    term_type?: 'term' | 'name' | 'skill'
}


export type GlossaryType = GlossaryItem[]


export type LanguagesType = 'English' | 'Chinese' | 'Korean' | 'Japanese'


export type ModelsType = 'standard' | 'b1' | 'b2' | 'sb1' | 'sb2' | 'b12'