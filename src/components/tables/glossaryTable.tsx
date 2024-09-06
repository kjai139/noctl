import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { Input } from "../ui/input"
import { FaFileUpload } from "react-icons/fa";
import { useState } from "react"
import { Button } from "../ui/button"
import { IoAlertCircleOutline } from "react-icons/io5";
import { GrDocumentDownload } from "react-icons/gr";
import { RiDeleteBin2Line } from "react-icons/ri";
import { GlossaryItem } from "@/app/_types/glossaryType";
import { TiDeleteOutline } from "react-icons/ti";

interface GlossaryTableTypes {
  glossary: GlossaryItem[],
  setGlossary: React.Dispatch<React.SetStateAction<GlossaryItem[]>>;
}

export default function GlossaryTable ({glossary, setGlossary}:GlossaryTableTypes) {

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

    const notifications = [
      {
        text:'The glossary file must be in JSON format'
      },
      {
        text:'Make sure the glossary is cleared out if not needed'
      },
      {
        text: 'It is highly recommended to double check any uncommon terms to ensure the highest quality'
      }
    ]

    const [testGloss, setTestGloss] = useState<GlossaryItem[]>()
    const [upLoadedFile, setUpLoadedFile] = useState<File | null>()
    const [errorMsg, setErrorMsg] = useState('')

    const handleInputchange = (newDef:string, id) => {
        const updatedData = glossary.map((node, idx) => {
            if (id === idx) {
                return (
                    {...node, definition: newDef}
                )
            } else {
                return node
            }
        })

        /* setTestGloss(updatedData) */
        setGlossary(updatedData)
    }

    const testGlossary = () => {
        setGlossary(glossary1)
        console.log('glossary:', glossary)
    }

    const handleUploadChange = (e:React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0].type === 'application/json') {
        const selectedFile = e.target.files[0]
        console.log('Uploaded File: ', selectedFile)
        const reader = new FileReader()
        //onload is triggered once reading is complete
        reader.onload = (e) => {

          try {
            if (!e.target || !e.target.result) {
              throw new Error('e.target is empty')
            }
            const json = JSON.parse(e.target.result as string)
            console.log('JSON uploaded:', json)
            setUpLoadedFile(selectedFile)
            setGlossary(json)
          } catch (err) {
            setErrorMsg('Invalid JSON file. Please double-check its content and reupload.')
          }
        }
        reader.readAsText(selectedFile)
        
        
      } else {
        setErrorMsg('Please upload a JSON file.')
      }
    }

    const downloadGlossary = () => {
        // null is the replacer and 2 is the space param for pretty-print
        const blob = new Blob([JSON.stringify(glossary, null, 2)], {type: 'application/json'})
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = 'glossary.json'
        document.body.appendChild(link)
        link.click()

        URL.revokeObjectURL(url)
        document.body.removeChild(link)
    }

    const resetGlossary = () => {
      setGlossary([])
      console.log('glossary reset.')
    }

    const deleteTerm = (term:string) => {
      setGlossary((prev) => prev!.filter((entry:GlossaryItem) => entry.term !== term))
    }

    return (
        <div className="shadow p-4 flex flex-col gap-4 max-w-[500px]">
        
        <div className="flex gap-2 flex-col text-xs">
        <Button onClick={testGlossary}>Test Glossary</Button>
          <div className="flex gap-2 items-start">
            <div>
          <IoAlertCircleOutline size={30}></IoAlertCircleOutline>
          </div>
          <p>An editable glossary will be auto-generated after each translation. You can then choose to save the glossary file and upload it for future uses.</p>
          </div>
          <ul>
            {notifications && notifications.map((node, idx) => {
              return (
                <li key={`noti-${idx}`}>
                  - {node.text}
                </li>
              )
            })}
          </ul>
          <h1 className="text-xl font-semibold">Glossary {upLoadedFile ? `- ${upLoadedFile.name}` : null}</h1>
        </div>
        <Table>
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Term</TableHead>
          <TableHead>Definition</TableHead>
          
        </TableRow>
      </TableHeader>
      <TableBody>
        {glossary && glossary.map((node:GlossaryItem, idx:number) => (
          <TableRow key={`tb-${idx}`}>
            <TableCell className="font-medium">{node.term}</TableCell>
            <TableCell className="flex gap-4">
                <Input type="text" maxLength={30} value={node.definition} onChange={(e) => handleInputchange(e.target.value, idx)}>
                </Input>
                <div>
                <Button variant={'ghost'} onClick={() => deleteTerm(node.term)}>
                  <TiDeleteOutline size={20}></TiDeleteOutline>

                </Button>
                </div>
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
    <div className="flex gap-4 ml-auto">
    {/* <Button onClick={checkGlossary}>Check Glossary</Button> */}
    {glossary.length > 0 ?
    <>
    <Button className="gap-2" onClick={resetGlossary}>
        <RiDeleteBin2Line></RiDeleteBin2Line>
        <span>Delete Glossary</span>
        </Button>
    <Button onClick={downloadGlossary} className="gap-2">
      <GrDocumentDownload></GrDocumentDownload>
      <span>Download Glossary</span></Button>
    </>
    : null
    }
    <div>
    <label htmlFor="file-upload" className="uploadBtn bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-1">
      <FaFileUpload></FaFileUpload><span>Upload</span>
    </label>
    <Input className="hidden" id="file-upload" type="file" accept=".json" onChange={handleUploadChange}></Input>
    
    </div>
    </div>
    </div>
    )
}