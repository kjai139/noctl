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
import EditGlossaryTLPopover from "../popover/glossaryTl";
import TButton from "../buttons/translationBtn";
import Papa from 'papaparse'


interface GlossaryTableTypes {
  glossary: GlossaryItem[],
  setGlossary: React.Dispatch<React.SetStateAction<GlossaryItem[]>>;
}

const glossary1: GlossaryItem[] = [
  {
    term: 'Kappa',
    translated_term: 'Sarcastic word spammed',
    term_type: 'term'
  },
  {
    term: 'KEKL',
    translated_term: 'making fun of something',
    term_type: 'term'
  }
]


export default function GlossaryTable() {

  const { glossary, setGlossary, isLoading } = useWorkState()



  const [testGloss, setTestGloss] = useState<GlossaryItem[]>()
  const [upLoadedFile, setUpLoadedFile] = useState<File | null>()
  const [errorMsg, setErrorMsg] = useState('')
  const [lang, setLang] = useState<LanguagesType>('English')
  const [editedGlossEntries, setEditedGlossEntries] = useState<{[id: number]: string}>({})


  const handleTempChange = (id: number, newValue:string) => {
    setEditedGlossEntries((prev) =>  ({...prev, [id]: newValue}))
  }

  const handleSaveChanges = (newDef: string, id:number) => {
    const updatedData = glossary.map((node, idx) => {
      if (id === idx) {
        return (
          { ...node, translated_term: newDef }
        )
      } else {
        return node
      }
    })

    /* setTestGloss(updatedData) */
    setGlossary(updatedData)
  }


  const handleInputchange = (newDef: string, id: number) => {
    const updatedData = glossary.map((node, idx) => {
      if (id === idx) {
        return (
          { ...node, translated_term: newDef }
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

  const checkValidJson = (arr:any[]) => {
    const requiredFields = ['term', 'translated_term']
    const jsonValid = arr.every(obj => {
      const keys = Object.keys(obj)
      return requiredFields.every(field => keys.includes(field))
    })
    console.log('[checkValidJson] is valid json:', jsonValid)
    return jsonValid
  }

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //JSON
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
          const isJsonValid = checkValidJson(json)
          if (!isJsonValid) {
            throw new Error('Invalid JSON')
          }
          setUpLoadedFile(selectedFile)
          setGlossary(json)
          
        } catch (err) {
          setErrorMsg('Invalid JSON format. Please double-check its content and reupload.')
        }
      }
      reader.readAsText(selectedFile)
      e.target.value = ''

      //CSV
    } else if (e.target.files && e.target.files[0].type === 'text/csv') {
      const selectedFile = e.target.files[0]
      console.log('Uploaded File: ', selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {

        try {
          if (!e.target || !e.target.result) {
            throw new Error('CSV empty')
          }
          const csv = e.target.result as string

          const result = Papa.parse(csv, {
            header: true,
            /* skipEmptyLines: true */
          })

          if (result.errors.length) {
            console.error('Error parsing CSV')
            throw new Error('Error parsing CSV.')
          }
          console.log('CSV uploaded:', result.data)

          setUpLoadedFile(selectedFile)
          
          const isJsonValid = checkValidJson(result.data)
          if (!isJsonValid) {
            throw new Error('Invalid CSV')
          }
            
          
          setGlossary(result.data as GlossaryItem[])

          
          
        } catch (err) {
          setErrorMsg('Invalid CSV file format. Please double-check its content and reupload.')
        }
      }
      reader.readAsText(selectedFile)
      e.target.value = ''

    } else {
      setErrorMsg('Invalid file type. Please upload a .CSV or .JSON file.')
    }
  }

  const downloadAsCsv = () => {
    const headers = Object.keys(glossary[0]) as (keyof GlossaryItem)[]
    console.log('[dlCsv] headers:', headers)

    const csvContent = [
      headers.join(','),
      ...glossary.map((row) => headers.map(key => `"${row[key]}"`).join(",")),
    ].join("\n")

    console.log('[dlcsv] Csv Content:', csvContent)

    const blob = new Blob([csvContent], { type: 'text/csv'})
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'glossary.csv'
    document.body.appendChild(link)
    link.click()

    URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }

  const downloadGlossary = () => {
    // null is the replacer and 2 is the space param for pretty-print
    const blob = new Blob([JSON.stringify(glossary, null, 2)], { type: 'application/json' })
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
    setUpLoadedFile(null)
    console.log('glossary reset.')
  }

  const deleteTerm = (term: string) => {
    setGlossary((prev) => prev!.filter((entry: GlossaryItem) => entry.term !== term))
  }

  const termLookup = (term: string) => {
    console.log('Looking up', term)
  }

  useEffect(() => {
    console.log('gloss lang set to :', lang)
    console.log('Glossary set:', glossary)
  }, [lang, glossary])

  return (
    <div className="flex flex-col gap-4 lg:max-w-[560px] max-w-none flex-1 mt-2">
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
          <div className="flex flex-col">
            <div className="flex gap-1 items-center">
              <h1 className="text-base font-semibold pl-2">Translation Glossary</h1>
              <GlossaryInfoDialog></GlossaryInfoDialog>
            </div>
            <span className="text-sm text-muted-foreground pl-2 min-h-[20px]">
              {upLoadedFile ? `Using: ${upLoadedFile.name}` : null}
            </span>
          </div>
          <div className="px-2">
            <label htmlFor="file-upload" className="cTwoBtn text-primary-foreground shadow h-9 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-1">
              <FaFileUpload></FaFileUpload><span>Upload</span>
            </label>
            <Input className="hidden" id="file-upload" type="file" accept=".json, .csv" onChange={handleUploadChange} disabled={isLoading}></Input>

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
                  <div className="flex-1 overflow-hidden">
                  <EditGlossaryTLPopover translation={node.translated_term} idx={idx} handleSave={handleSaveChanges}>

                  </EditGlossaryTLPopover>
                  </div>

                 

                  <div className="flex items-center justify-center flex-1">


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
              <Button variant={'glossary'} onClick={downloadAsCsv} className="gap-2">
                <GrDocumentDownload></GrDocumentDownload>
                <span>Save File</span></Button>
            </>
            : null
          }


        </div>
      </div>

    </div>
  )
}