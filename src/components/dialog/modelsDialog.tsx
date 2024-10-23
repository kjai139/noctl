import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { IoIosStarOutline } from "react-icons/io";
import { IoIosStarHalf } from "react-icons/io";
import { IoIosStar } from "react-icons/io";
import StarsIcons from "../icons/stars";

const models = [
    {
        name:"Standard",
        accuracy: 3,
        info: "Much better than Google Translate & slightly better than DeepL. Occasional pronoun errors.",
        pricing: "Free"
    },
    {
        name:"Better-1",
        accuracy: 4.5,
        info: "More accurate than the 'Standard' model and better comprehension with slightly less pronoun errors.",
        pricing: "100 requests @ $5 USD"
    },

]


export default function ModelsDialog () {


    return (
        <Dialog>
            <DialogTrigger>
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
                    <TableCaption>Each translation request handles up to 2000 characters. Text longer than that will be broken up into parts.</TableCaption>
                    <TableHeader>
                        <TableRow>
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
                    <TableBody>
                        {
                            models.map((model, idx) => {
                                return (
                                    <TableRow key={`mdl-${idx}`}>
                                        <TableCell>
                                            {model.name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StarsIcons rating={model.accuracy}></StarsIcons>
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