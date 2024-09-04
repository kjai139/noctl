"use client"
import { Control, useForm, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { translateTxt } from "@/app/action";
import { useWorkState } from "@/app/_contexts/workStateContext";
import GlossaryTable from "../tables/glossaryTable";
import { useEffect } from "react";
import { GlossaryItem, GlossaryType } from "@/app/_types/glossaryType";


const tokenLimit = 1024

const language = [
    {
        name:'Japanese'
    },
    {
        name:'Korean'
    },
    {
        name:'English'
    },
    {
        name:'Chinese'
    }

]

const languageChoices = language.map(item => item.name)

const formSchema = z.object({
    language: z.string({
        message: 'Please choose a language'
    }).refine(value => languageChoices.includes(value), {
        message: 'Please choose a language'
    }),
    targetText: z.string().max(tokenLimit, {
        message: `Cannot exceed ${tokenLimit} tokens per request.`
    })
})

function TextAreaWatched ({control}:{control: Control<z.infer<typeof formSchema>>}) {
    const textarea = useWatch({
        control,
        name: 'targetText',
        defaultValue:''
    })

    return <p>{textarea.length} / {tokenLimit}</p>
}

export default function MainInputForm () {
    const {setGlossary, curResult, setCurResult, glossary, setUnsure} = useWorkState()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
    })

    

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('submitted', values)
        try {
            let normalizedGlossary
            if (glossary.length > 0) {
                normalizedGlossary = glossary.map((entry) => {
                    return (
                        {
                            ...entry,
                            term: entry.term.toLowerCase(),
                            
                        }
                    )
                })
            }

            const params = {
                text:values.targetText,
                language: values.language,
                ...(glossary.length > 0 && {glossary:JSON.stringify(normalizedGlossary)})
            }
            const result = await translateTxt(params)
            console.log(result)

            if (result && result.length > 0) {
                if (result[0].type === 'text') {
                    const jsonResult = JSON.parse(result[0].text)
                    console.log('JSON format of api response: ', jsonResult)
                    //add new entries if not dupe - backend should only return normalized results
                    if (normalizedGlossary && normalizedGlossary.length > 0) {
                        const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                        jsonResult.glossary.forEach((newentry:GlossaryItem) => {
                            /* let normalizedterm = newentry.term.toLowerCase() */
                            if (!termSet.has(newentry.term)){
                                termSet.add(newentry.term)
                                normalizedGlossary.unshift(newentry)
                            } else {
                                console.log(`Entry ${newentry.term} already exists.`)
                            }
                        })
                        setGlossary(normalizedGlossary)
                    } else {
                        setGlossary(jsonResult.glossary)
                    }
                    
                    
                    
                    
                    setCurResult(jsonResult.content)
                    setUnsure(jsonResult.unsure)
                }
                
            }
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        console.log('main re-rendered')
    })

  
   
    return (
        <div className="flex gap-8">
            <div>
        <GlossaryTable glossary={glossary} setGlossary={setGlossary}></GlossaryTable>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 flex-col">
                <div className="flex">
                <FormField
                control={form.control}
                name="language"
                render={({field}) => (
                    
                    <FormItem>
                        
                        <FormLabel>Output Language</FormLabel>
                        
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Language"></SelectValue>
                                </SelectTrigger>
                            </FormControl>
                                <SelectContent>
                                    {
                                        language.map((node, idx) => {
                                            return (
                                                <SelectItem value={node.name} key={`lg-${idx}`}>
                                                       {node.name} 
                                                </SelectItem>
                                            )
                                        })
                                    }
                                </SelectContent>
                            
                            </Select>
                        
                    </FormItem>
                    
                )}
                >

                </FormField>
    
                </div>
                <div className="flex flex-col gap-4 main-wrap border-4 border-transparent rounded-xl">
                <FormField control={form.control}
                name="targetText"
                render={({field}) => (
                    <FormItem>
                        {/* <FormLabel className="p-4">
                            What would you like to translate?
                        </FormLabel> */}
                            <FormControl>
                                <Textarea onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }} placeholder="Enter text..." {...field} className="min-w-[300px] sm:min-w-[600px] border-none shadow-none resize-none main-ta focus-visible:ring-0">

                                </Textarea>
                                
                            </FormControl>
                            
                        
                    </FormItem>
                )}
                >

                </FormField>
                <div className="justify-end flex gap-2 items-center p-2">
                <div className="text-destructive p-0 flex gap-2">
                    {form.formState.errors.targetText ? form.formState.errors.targetText.message : null }
                    {form.formState.errors.language ? form.formState.errors.language.message : null }
                    <TextAreaWatched control={form.control}></TextAreaWatched>
                </div>
                <Button className="rounded-lg py-0" variant={'ghost'} type="submit">Translate</Button>
                </div>
                </div>
            </form>
        </Form>
        
        </div>
    )
}