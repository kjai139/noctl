'use client'

import { useWorkState } from "@/app/_contexts/workStateContext"
import MainInputForm from "../forms/mainInputForm"
import GlossaryTable from "../tables/glossaryTable"

export default function MainWrapper () {

    const { glossary } = useWorkState()

    return (
        <div className="flex flex-col gap-8">
        <h1 className="md:text-4xl text-center">NOCTURNE</h1>
        <MainInputForm></MainInputForm>
        <GlossaryTable glossary={glossary}></GlossaryTable>
      </div>
    )
}