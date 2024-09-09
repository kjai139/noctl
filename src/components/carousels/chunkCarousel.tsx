import { useWorkState } from "@/app/_contexts/workStateContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Card, CardContent } from "../ui/card";



export default function ChunkCarousel () {

    const { chunks } = useWorkState()

    return (
       <div className="c-grid w-full gap-4">
            {chunks.length > 0 && chunks.map((chunk, idx) => {
                return (
                    <div key={`caro-${idx}`}>
                        
                        <Card>
                            <CardContent className="flex aspect-square justify-center items-center">
                                <span>
                                    {idx + 1}
                                </span>
                            </CardContent>

                        </Card>
                        
                    </div>
                )
            })}

        </div>
    )
}