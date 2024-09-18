import { GlossaryItem } from "@/app/_types/glossaryType";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SetStateAction } from "react";

interface AddGlossaryEntryBtnProps {
    glossary: GlossaryItem[],
    setGlossary: React.Dispatch<SetStateAction<GlossaryItem[] | []>>
}

export default function AddGlossEntryBtn ({glossary, setGlossary}:AddGlossaryEntryBtnProps) {

    return (
        <Dialog>
            <DialogTrigger asChild>
            <Button>Add Term</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add term
                    </DialogTitle>
                    <DialogDescription>
                        Add a term to the glossary
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Label htmlFor="term">
                        Term
                    </Label>
                    <Input id="term" defaultValue={"カッパ"}>
                    </Input>
                </div>
                <div>
                    <Label htmlFor="definition">
                        Definition
                    </Label>
                    <Input id="definition" defaultValue={"Kappa"}></Input>
                </div>
                <DialogFooter>
                    <Button>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}