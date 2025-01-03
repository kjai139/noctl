'use client'
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
import { GrDocumentDownload } from "react-icons/gr";
import { RiDeleteBin2Line } from "react-icons/ri";
import { GlossaryItem, LanguagesType } from "@/app/_types/glossaryType";
import SearchTermBtn from "../buttons/searchTermBtn";
import GlossaryLanguageSelect from "../select/languageSelect";
import DeleteTermBtn from "../buttons/deleteTermBtn";
import AddGlossEntryBtn from "../buttons/addGlossEntryBtn";
import GlossaryInfo from "../cards/glossaryInfo";
import GlossaryInfoDialog from "../dialog/glossaryInfoDialog";
import { useWorkState } from "@/app/_contexts/workStateContext";

interface GlossaryTableTypes {
  glossary: GlossaryItem[],
  setGlossary: React.Dispatch<React.SetStateAction<GlossaryItem[]>>;
}

const glossary1:GlossaryItem[] = [
  {
      term:'Kappa',
      translated_term:'Sarcastic word spammed',
      term_type:'term'
  },
  {
      term:'KEKL',
      translated_term:'making fun of something',
      term_type: 'term'
  }
]


export default function GlossaryTable () {

   const { glossary, setGlossary, isLoading } = useWorkState()

    

    const [testGloss, setTestGloss] = useState<GlossaryItem[]>()
    const [upLoadedFile, setUpLoadedFile] = useState<File | null>()
    const [errorMsg, setErrorMsg] = useState('')
    const [lang, setLang] = useState<LanguagesType>('English')


    const handleInputchange = (newDef:string, id:number) => {
        const updatedData = glossary.map((node, idx) => {
            if (id === idx) {
                return (
                    {...node, translated_term: newDef}
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
      console.log('Glossary set:', glossary)
    },[lang, glossary])

    return (
      <div className="flex flex-col gap-4 lg:max-w-[560px] max-w-none flex-1">
        {/* <div>
        <div className="flex justify-end">

            {
              glossary && glossary.length > 0 ?
              <GlossaryLanguageSelect setLang={setLang}></GlossaryLanguageSelect> : null
            }

          </div>
        </div> */}
        <div className="gloss-wrap flex flex-col gap-4">
          
          <div className="flex justify-between items-center">
            <div>
            <div className="flex gap-1 items-center">
            <h1 className="text-lg font-semibold pl-2">Glossary</h1>
            <GlossaryInfoDialog></GlossaryInfoDialog>
            </div>
            <span className="text-sm text-muted-foreground pl-2">
            {upLoadedFile ? `Using: ${upLoadedFile.name}` : null}
            </span>
            </div>
            <div className="px-2">
              <label htmlFor="file-upload" className="cTwoBtn text-primary-foreground shadow h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-1">
                <FaFileUpload></FaFileUpload><span>Upload</span>
              </label>
              <Input className="hidden" id="file-upload" type="file" accept=".json" onChange={handleUploadChange} disabled={isLoading}></Input>
              
            </div>
          </div>
          
          <div className="flex justify-between items-center px-2">
          <div>
          
          {
              glossary && glossary.length > 0 ?
              <GlossaryLanguageSelect setLang={setLang}></GlossaryLanguageSelect> : null
            }
          </div>
          <div>
          
          <AddGlossEntryBtn setGlossary={setGlossary} glossary={glossary}></AddGlossEntryBtn>

          </div>
          </div>
        
        <Table>
          {
            glossary && glossary.length > 0 ?
              <TableCaption>Use Ctrl + F to find terms quickly</TableCaption> : null
          }

          <TableHeader className="sticky top-0 bg-muted shadow">
            <TableRow>
              {/* <TableHead className="w-[60px]">Type</TableHead> */}
              <TableHead className="w-[100px]">Term</TableHead>
              <TableHead>Translation</TableHead>
              



            </TableRow>
          </TableHeader>
          <TableBody>
            {glossary && glossary.map((node: GlossaryItem, idx: number) => (
              <TableRow key={`tb-${idx}`}>
                {/* <TableCell>
                  {node.term_type === 'name' ? 'N' : null}
                  {node.term_type === 'term' || node.term_type === 'skill' ? 'T' : null}
                </TableCell> */}
                <TableCell className="font-medium">
                  <span>
                    {node.term}
                  </span>
                </TableCell>

                <TableCell className="flex gap-4">
                  
                    <Tooltip>
                      <TooltipTrigger>
                  <Input type="text" maxLength={30} value={node.translated_term} onChange={(e) => handleInputchange(e.target.value, idx)}>
                  </Input>
                  </TooltipTrigger>
                  <TooltipContent>
                  <span>{node.translated_term}</span>
                  </TooltipContent>
                  </Tooltip>
                  
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
              <TableCell colSpan={3}>"T" stands for term and "N" for name</TableCell>

            </TableRow>
            
          </TableFooter> */}
        </Table>

        <div className="flex gap-4 ml-auto px-2">

          {glossary && glossary.length > 0 ?
            <>
              <Button variant={'glossary'} className="gap-2" onClick={resetGlossary}>
                <RiDeleteBin2Line></RiDeleteBin2Line>
                <span>Clear All</span>
              </Button>
              <Button variant={'glossary'} onClick={downloadGlossary} className="gap-2">
                <GrDocumentDownload></GrDocumentDownload>
                <span>Download</span></Button>
            </>
            : null
          }

          
        </div>
        </div>

      </div>
    )
}