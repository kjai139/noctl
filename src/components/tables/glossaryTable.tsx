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
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Input } from "../ui/input"
import { FaFileUpload } from "react-icons/fa";
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { IoAlertCircleOutline } from "react-icons/io5";
import { GrDocumentDownload } from "react-icons/gr";
import { RiDeleteBin2Line } from "react-icons/ri";
import { GlossaryItem, LanguagesType } from "@/app/_types/glossaryType";
import { TiDeleteOutline } from "react-icons/ti";
import { TbReportSearch } from "react-icons/tb";
import SearchTermBtn from "../buttons/searchTermBtn";
import GlossaryLanguageSelect from "../select/languageSelect";
import DeleteTermBtn from "../buttons/deleteTermBtn";
import AddGlossEntryBtn from "../buttons/addGlossEntryBtn";

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
        text:'New terms from subsequent translation request will continue to add onto the current glossary'
      },
      {
        text:'The glossary file you upload must be in JSON format'
      },
      {
        text:'Make sure the glossary is cleared out if not needed'
      },
      {
        text:'Type T stands for Terms and N stands for Names'
      }
    ]

    const [testGloss, setTestGloss] = useState<GlossaryItem[]>()
    const [upLoadedFile, setUpLoadedFile] = useState<File | null>()
    const [errorMsg, setErrorMsg] = useState('')
    const [lang, setLang] = useState<LanguagesType>('English')

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

    const termLookup = (term:string) => {
      console.log('Looking up', term)
    }

    useEffect(() => {
      console.log('gloss lang set to :', lang)
    },[lang])

    return (
        <div className="shadow p-4 flex flex-col gap-4 max-w-[560px]">
        
        <div className="flex gap-2 flex-col text-xs">
        {/* <Button onClick={testGlossary}>Test Glossary</Button> */}
          <div className="flex gap-2 items-start">
            <div>
          <IoAlertCircleOutline size={30}></IoAlertCircleOutline>
          </div>
          <p>This is a glossary to keep terms and names consistent when translating novels. An editable glossary will be auto-generated after each translation. You can then edit as needed and you can choose to save the glossary file as well</p>
          </div>
          <ul>
            {notifications && notifications.map((node, idx) => {
              return (
                <li key={`noti-${idx}`} className="list-disc ml-4">
                  {node.text}
                </li>
              )
            })}
          </ul>
          <div className="flex justify-end">
          
        
          <GlossaryLanguageSelect setLang={setLang}></GlossaryLanguageSelect>
        
          </div>
          <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Glossary {upLoadedFile ? `- ${upLoadedFile.name}` : null}</h1>
          <div>
          <AddGlossEntryBtn setGlossary={setGlossary} glossary={glossary}></AddGlossEntryBtn>
          </div>
          </div>
        </div>
        <Table>
        {
          glossary && glossary.length > 0 ?
          <TableCaption>Use Ctrl + F to find terms quickly</TableCaption> : null
        }
      
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px]">Type</TableHead>
          <TableHead className="w-[100px]">Term</TableHead>
          <TableHead>Definition</TableHead>
          
          
          
        </TableRow>
      </TableHeader>
      <TableBody>
        {glossary && glossary.map((node:GlossaryItem, idx:number) => (
          <TableRow key={`tb-${idx}`}>
            <TableCell>
              {node.term_type === 'name' ? 'N' : null}
              {node.term_type === 'term' || node.term_type === 'skill' ? 'T' : null}
            </TableCell>
            <TableCell className="font-medium">
              <span>
              {node.term}
              </span>
            </TableCell>
            
            <TableCell className="flex gap-4">
                <Input type="text" maxLength={30} value={node.definition} onChange={(e) => handleInputchange(e.target.value, idx)}>
                </Input>
                <div className="flex items-center">
                  
              
                <SearchTermBtn term={node.term} language={lang}></SearchTermBtn>
                <DeleteTermBtn onClick={() => deleteTerm(node.term)}></DeleteTermBtn>
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
        <span>Clear</span>
        </Button>
    <Button onClick={downloadGlossary} className="gap-2">
      <GrDocumentDownload></GrDocumentDownload>
      <span>Download</span></Button>
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