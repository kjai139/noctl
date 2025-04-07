'use client'
import React, { ReactElement, ReactNode, SetStateAction, useContext, useRef, useState } from "react";
import { FixedSizeList, FixedSizeListProps } from "react-window"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";


type VirtualTableContextType = {
    top: number;
    setTop: (top: number) => void
    header?: ReactNode;
    footer?: ReactNode;
  };

const VirtualTableContext = React.createContext<VirtualTableContextType>({
    top: 0,
    setTop: (top: number) => { },
    header: <></>,
    footer: <></>,
})


interface VirtualTableProps extends Omit<FixedSizeListProps, "children" | "innerElementType"> {
    row: FixedSizeListProps["children"];
    header?: ReactNode
    footer?: ReactNode

}

const VirtualTable = ({
    row,
    header,
    footer,
    ...rest
}: VirtualTableProps) => {
    const listRef = useRef<FixedSizeList | null>()
    const [top, setTop] = useState(0)

    const Inner = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        function Inner({ children, ...rest }, ref) {
            const { header, footer, top } = useContext(VirtualTableContext)
            return (
                <div {...rest} ref={ref}>
                    <Table style={{
                        top: top,
                        position:'absolute',
                        width: '100%'
                    }}>
                        <TableBody>
                            {children}
                        </TableBody>
                    </Table>
                </div>
            )
        }
    )

    const handleRef: React.LegacyRef<FixedSizeList> = (el) => {
        listRef.current = el;
      };

    return (
        <VirtualTableContext.Provider value={{ top, setTop, header, footer }}>
            <FixedSizeList
                {...rest}
                innerElementType={Inner}
                onItemsRendered={props => {
                    const style = listRef.current &&
                        // @ts-ignore private method access
                        listRef.current._getItemStyle(props.overscanStartIndex)
                    setTop((style && style.top) || 0)
                    rest.onItemsRendered && rest.onItemsRendered(props)
                }}
                ref={handleRef}
            >
                {row}

            </FixedSizeList>
        </VirtualTableContext.Provider>
    )
}


export default VirtualTable
