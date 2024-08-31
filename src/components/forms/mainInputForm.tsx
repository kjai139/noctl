"use client"
import { Control, useForm, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { translateTxt } from "@/app/action";
import { useState } from "react";


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
        name: 'targetText'
    })

    return <p>{textarea.length} / {tokenLimit}</p>
}

export default function MainInputForm () {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('submitted', values)
        try {
            const result = await translateTxt(values.targetText, values.language)
            console.log(result)
        } catch (err) {
            console.error(err)
        }
    }

    

   

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
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
                <div className="flex flex-col gap-4">
                <FormField control={form.control}
                name="targetText"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="p-4">
                            What would you like to translate?
                        </FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter text..." {...field} className="min-w-[300px] sm:min-w-[600px] resize-none sm:min-h-[300px]">

                                </Textarea>
                                
                            </FormControl>
                            <div className="text-destructive p-2 flex gap-2">
                                {form.formState.errors.targetText ? form.formState.errors.targetText.message : null }
                                {form.formState.errors.language ? form.formState.errors.language.message : null }
                                <TextAreaWatched control={form.control}></TextAreaWatched>
                            </div>
                        
                    </FormItem>
                )}
                >

                </FormField>
                <div className="justify-end flex">
                <Button type="submit">Translate</Button>
                </div>
                </div>
            </form>
        </Form>
    )
}