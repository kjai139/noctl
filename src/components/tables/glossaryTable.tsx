import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  import { Input } from "../ui/input"
import { useState } from "react"
import { Button } from "../ui/button"

export default function GlossaryTable ({glossary, setGlossary}) {

    /* if (glossary.length === 0) {
        return (
            <div>
                No glossary in use currently.
            </div>
        )
    } */

    const glossary1 = [
        {
            term:'Kappa',
            definition:'Sarcastic word spammed'
        },
        {
            term:'KEKL',
            definition:'making fun of something'
        }
    ]

    const [testGloss, setTestGloss] = useState(glossary1)

    const handleInputchange = (newDef, id) => {
        const updatedData = testGloss.map((node, idx) => {
            if (id === idx) {
                return (
                    {...node, definition: newDef}
                )
            } else {
                return node
            }
        })

        setTestGloss(updatedData)
    }

    const checkGlossary = () => {
        console.log(testGloss)
    }

    const downloadGlossary = () => {
        // null is the replacer and 2 is the space param for pretty-print
        const blob = new Blob([JSON.stringify(testGloss, null, 2)], {type: 'application/json'})
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = 'glossary.json'
        document.body.appendChild(link)
        link.click()

        URL.revokeObjectURL(url)
        document.body.removeChild(link)
    }

    return (
        <div className="shadow p-4 flex flex-col gap-8">
        <h1 className="text-xl font-semibold">Glossary</h1>
        <Table>
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Term</TableHead>
          <TableHead>Definition</TableHead>
          
        </TableRow>
      </TableHeader>
      <TableBody>
        {testGloss.map((node, idx) => (
          <TableRow key={`tb-${idx}`}>
            <TableCell className="font-medium">{node.term}</TableCell>
            <TableCell>
                <Input type="text" maxLength={25} value={node.definition} onChange={(e) => handleInputchange(e.target.value, idx)}>
                </Input>
            </TableCell>
            
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
        
      </TableFooter> */}
    </Table>
    <div className="flex gap-4">
    <Button onClick={checkGlossary}>Check Glossary</Button>
    <Button onClick={downloadGlossary}>Download Glossary</Button>
    </div>
    </div>
    )
}