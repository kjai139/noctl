import { IoIosStarOutline } from "react-icons/io";
import { IoIosStarHalf } from "react-icons/io";
import { IoIosStar } from "react-icons/io";



export default function StarsIcons ({rating}:{rating: number}) {

    const stars = []
    const color = '#facc15'

    for (let i = 0; 5 > i; i++) {
        if (rating - i > 0 && rating - i !== .5) {
            stars.push(
                <IoIosStar key={`star${i}`} color={color}></IoIosStar>
            )
        } else if (rating === 0) {
            stars.push(
                <IoIosStarOutline key={`star${i}`}></IoIosStarOutline>
            )
        } else if (rating === 5) {
            stars.push(
                <IoIosStar key={`star${i}`} color={color} />
            )
        } else if (rating - i === .5) {
            stars.push(
                <IoIosStarHalf key={`star${i}`} color={color}></IoIosStarHalf>
            )
        } else if (rating - 1 < 0) {
            stars.push(
                <IoIosStarOutline key={`star${i}`}></IoIosStarOutline>
            )
        } else {
            stars.push(
                <IoIosStarOutline key={`star${i}`} color={color}></IoIosStarOutline>
            )
        }
    }


    return (
        <div className="flex">
            {stars}
        </div>
    )
}