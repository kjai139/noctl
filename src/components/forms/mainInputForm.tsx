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


const tokenLimit = 5000

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
    const {setGlossary, curResult, setCurResult, glossary, setUnsure, isLoading, setIsLoading} = useWorkState()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues: {
            language: 'English'
        }
    })

    

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('submitted', values)
        setIsLoading(true)
        try {
            let normalizedGlossary
            let filteredGlossary
            const normalizedtext = values.targetText.toLowerCase()
            .replace(/[(){}\[\]<>]/g, ' ')  
            .replace(/[!"#$%&'*+,\-./:;<=>?@[\]^_`{|}~]/g, '')
            
            if (glossary.length > 0) {
                normalizedGlossary = glossary.map((entry) => {
                    return (
                        {
                            ...entry,
                            term: entry.term.toLowerCase(),
                            
                        }
                    )
                })

                if (normalizedGlossary) {
                    filteredGlossary = normalizedGlossary.filter((entry:GlossaryItem) => normalizedtext.includes(entry.term))
                }

                
            }

            
            console.log('Non filtered Glossary:', glossary)
            console.log('Filtered Glossary:', filteredGlossary)

            const params = {
                text:values.targetText,
                language: values.language,
                ...(glossary.length > 0 && {glossary:JSON.stringify(filteredGlossary)})
            }
            console.log('Params used:', params)
            const result = await translateTxt(params)
            console.log('Api response:', result)

            if (result && result[0]) {
                if (result[0].type === 'tool_use') {
                    const textResult = result[0].input.text
                    const glossaryResult = result[0].input.glossary
                   
                    //add new entries if not dupe - backend should only return normalized results
                    if (normalizedGlossary && normalizedGlossary.length > 0) {
                        console.log('Normalized Glossary used')
                        const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                        glossaryResult.forEach((newentry:GlossaryItem) => {
                            /* let normalizedterm = newentry.term.toLowerCase() */
                            if (!termSet.has(newentry.term.toLowerCase())){
                                termSet.add(newentry.term)
                                normalizedGlossary.unshift(newentry)
                            } else {
                                console.log(`Entry ${newentry.term} already exists.`)
                            }
                        })
                        setGlossary(normalizedGlossary)
                    } else {
                        setGlossary(glossaryResult)
                    }
                    
                    
                    
                    
                    setCurResult(textResult)
                    
                
                }
                
            }
            setIsLoading(false)
        } catch (err) {
            console.error(err)
           
            setIsLoading(false)
        }
    }

    useEffect(() => {
        console.log('main re-rendered')
    })

    const setCurResultHandle = () => {
        const text = `Cover folding

        Preface.

        The Heavenly Demon has died.

        With that, the long and drawn-out battle between righteousness and evil has also come to an end.
        The hellish times that persisted for years could finally conclude with the death of the Heavenly Demon.

        Many cheered and rejoiced at the defeat of the demonic sect. They said that peace had finally been restored.
        However, what remained at the end of the war was not just relief and peace.

        Two of the Nine Major Sects that supported the righteous faction of the martial arts world were burned to ashes, and one of the Four Great Clans collapsed.
        Even the three masters known as the 'Three Venerables' among the countless warriors of the Central Plains were all killed by the Heavenly Demon's hand.

        Although they succeeded in killing the Heavenly Demon and erasing the demonic sect from this land, it remained a war full of losses.

        Too much had been lost.
        No one knew how long it would take to recover and restore what had been scattered and destroyed.

        Nevertheless.

        Even though much had burned to ashes, what remained was not just despair.
        Somewhere, hope would bloom, and heroes who would overcome the crisis and continue the alliance would gradually appear.

        However.

        It was a story that didn't concern me.

        "Where is it?"

        The woman murmured in a small voice.`
        setCurResult(text)
    }

  
   
    return (
        <div className="flex gap-8 justify-center">
            <div>
                <Button onClick={setCurResultHandle}>Test output</Button>
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
                                    <SelectValue placeholder="Select Language">
                                    </SelectValue>
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
                                }} placeholder="Enter text..." {...field} className="min-w-[300px] sm:min-w-[600px] max-h-[650px] border-none shadow-none resize-none main-ta focus-visible:ring-0" disabled={isLoading}>

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
                <Button className="rounded-lg py-0" variant={'ghost'} type="submit" disabled={isLoading}>Translate</Button>
                </div>
                </div>
            </form>
        </Form>
        
        </div>
    )
}