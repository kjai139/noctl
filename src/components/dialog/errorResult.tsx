import { SetStateAction } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";


interface ErrorResultAlertProps {
    errorMsg: string,
    setErrorMsg: React.Dispatch<SetStateAction<string>>
}


export default function ErrorResultAlert ({errorMsg, setErrorMsg}:ErrorResultAlertProps) {

    const closeModal = () => {
        setErrorMsg('')
    }

    return (
        <AlertDialog open={errorMsg ? true : false}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Error
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {errorMsg}

                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={closeModal}>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
    )
}