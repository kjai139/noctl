import { standardModelLimit } from "@/lib/modelQuota";
import StarsIcons from "../icons/stars";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const models = [
    {
        name: "Free",
        accuracy: 3.5,
        info: "Better than Google Translate & DeepL. Occasional speaker attribution errors.",
        pricing: `Free, ${standardModelLimit} requests every 10 min`
    },
    {
        name: "Better-1",
        accuracy: 4.5,
        info: "Higher reading comprehension, more accurate, and less speaker attribution errors compared to the free model.",
        pricing: "50 requests @ $5 USD"
    },
    {
        name: "Better-2",
        accuracy: 4.5,
        info: "About the same as Better-1. Sometimes better sometimes worse.",
        pricing: "50 requests @ $5 USD"
    },
    {
        name: "Duo modes",
        accuracy: 'N/A',
        info: "Uses 2 models at the same time.",
        pricing: 'The total cost of the two chosen models.'
    },

]


export default function ModelsDialog() {


    return (
        <Dialog>
            <DialogTrigger className="font-semibold text-muted-foreground hover:text-primary">
                Models
            </DialogTrigger>
            <DialogContent className="max-w-[40rem]">
                <DialogHeader>
                    <DialogTitle>
                        AI Models
                    </DialogTitle>
                    <DialogDescription>
                        The AI models available
                    </DialogDescription>
                </DialogHeader>
                <Table>
                    <TableCaption>
                        <span className="flex flex-col gap-1">
                            <span>Each translation request handles up to 2000 characters max. Text longer than that will be broken up into parts. Signing in with gmail is required to prevent abuse.
                            </span>
                        </span>

                    </TableCaption>
                    <TableHeader className="hidden sm:table-header-group">
                        <TableRow className="hidden sm:table-row">
                            <TableHead>
                                Model
                            </TableHead>
                            <TableHead>
                                Accuracy
                            </TableHead>
                            <TableHead>
                                Details
                            </TableHead>
                            <TableHead>
                                Pricing
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="flex flex-col sm:table-row-group">
                        {
                            models.map((model, idx) => {
                                return (
                                    <TableRow key={`mdl-${idx}`} className="flex flex-col sm:table-row">
                                        <TableCell className="font-semibold">
                                            {model.name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            
                                            {
                                                typeof model.accuracy === 'number' ?
                                                <StarsIcons rating={model.accuracy}></StarsIcons> : 
                                                <span>
                                                    {model.accuracy}
                                                </span> 
                                            }
                                            
                                        </TableCell>
                                        <TableCell>
                                            {model.info}
                                        </TableCell>
                                        <TableCell>
                                            {model.pricing}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}