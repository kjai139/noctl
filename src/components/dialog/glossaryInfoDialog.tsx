import GlossaryInfo from "../cards/glossaryInfo";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { RxQuestionMarkCircled } from "react-icons/rx";

export default function GlossaryInfoDialog() {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={'icon'} variant={'outline'} className="shadow-none rounded-full border-none w-auto h-auto p-1 bg-inherit">
                    <RxQuestionMarkCircled color="blue" size={20}></RxQuestionMarkCircled>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Glossary
                    </DialogTitle>
                    <DialogDescription>
                        What's this?
                    </DialogDescription>
                </DialogHeader>
                <GlossaryInfo></GlossaryInfo>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}