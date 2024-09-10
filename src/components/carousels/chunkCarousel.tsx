'use client'
import { useWorkState } from "@/app/_contexts/workStateContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Card, CardContent } from "../ui/card";
import { SetStateAction, useEffect } from "react";
import { Button } from "../ui/button";


interface ChunkCarouselProps {
    setTextArea: (content:string) => void,
    setSelectedChunk: React.Dispatch<SetStateAction<number>>,
    selectedChunk: number
}

export default function ChunkCarousel ({setTextArea, setSelectedChunk, selectedChunk}:ChunkCarouselProps) {

    const { chunks } = useWorkState()

    useEffect(() => {
        if (chunks && chunks.length > 0) {
            console.log('Page changed to', selectedChunk)
            setTextArea(chunks[selectedChunk])
        }
    }, [selectedChunk])

    return (
       <div className="c-grid w-full gap-4 items-end">
            {chunks.length > 0 && chunks.map((chunk, idx) => {
                return (
                    <div key={`caro-${idx}`}>
                        <Button type="button" className="w-full" variant={'outline'} onClick={() => setSelectedChunk(idx)}>
                            {idx + 1}
                        </Button>
                    </div>
                )
            })}

        </div>
    )
}