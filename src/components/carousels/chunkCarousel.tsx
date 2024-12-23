'use client'
import { useWorkState } from "@/app/_contexts/workStateContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Card, CardContent } from "../ui/card";
import { SetStateAction, useEffect } from "react";
import { Button } from "../ui/button";


interface ChunkCarouselProps {
    setTextArea: (content:string) => void,
    setSelectedChunk: React.Dispatch<SetStateAction<number | null>>,
    selectedChunk: number | null,
    isDisabled: boolean,
}

export default function ChunkCarousel ({setTextArea, setSelectedChunk, selectedChunk, isDisabled}:ChunkCarouselProps) {

    const { chunks } = useWorkState()

    useEffect(() => {
        if (chunks.length > 0) {
            setSelectedChunk(0)
            console.log('chunks ue ran -', chunks)
        }
    }, [chunks])

    useEffect(() => {
        if (chunks && chunks.length > 0 && selectedChunk !== null) {
            console.log('Page changed to', selectedChunk)
            setTextArea(chunks[selectedChunk])
            console.log('setting to', chunks[selectedChunk])
        }
    }, [selectedChunk])


    return (
       <div className="c-grid w-full gap-4 items-end">
            {chunks.length > 0 && chunks.map((chunk, idx) => {
                return (
                    <div key={`caro-${idx}`}>
                        <Button disabled={selectedChunk === idx || isDisabled} type="button" className={`w-full ${selectedChunk === idx ? 'selected' : null}`} variant={'outline'} onClick={() => setSelectedChunk(idx)}>
                            {idx + 1}
                        </Button>
                    </div>
                )
            })}

        </div>
    )
}