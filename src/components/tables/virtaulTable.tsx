'use client'
import React, { useContext, useRef, useState } from "react";
import { FixedSizeList, FixedSizeListProps } from "react-window"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const VirtualTableContext = React.createContext({
    top: 0,
    setTop: (top: number) => { },
    header: <></>,
    footer: <></>,
})


interface VirtualTableProps extends Omit<FixedSizeListProps, "children" | "innerElementType"> {
    row: FixedSizeListProps["children"];
    header?: React.ReactNode;
    footer?: React.ReactNode;

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
                        position:'relative',
                    }}>
                        <TableHeader className="sticky top-0 bg-muted shadow">
                            <TableRow>
                                {/* <TableHead className="w-[60px]">Type</TableHead> */}
                                <TableHead className="w-[100px]">Term</TableHead>
                                <TableHead>Translation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {children}
                        </TableBody>
                    </Table>
                </div>
            )
        }
    )

    

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
                ref={el => (listRef.current = el)}
            >
                {row}

            </FixedSizeList>
        </VirtualTableContext.Provider>
    )
}


export default VirtualTable
