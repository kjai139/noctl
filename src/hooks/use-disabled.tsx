import { useEditTabContext } from "@/app/_contexts/editContext";
import { useWorkState } from "@/app/_contexts/workStateContext";
import { useMemo } from "react";


export default function useButtonDisabled () {
    const { isSlot1Editing, isSlot2Editing } = useEditTabContext()
    const { isLoading } = useWorkState()

    return useMemo(() => isSlot1Editing || isSlot2Editing || isLoading, [isSlot1Editing, isSlot2Editing, isLoading])
}