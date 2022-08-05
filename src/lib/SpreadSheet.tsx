import React, {
  useState,
  useReducer,
  useRef,
  useEffect,
  useMemo,
  useCallback
} from "react"
import "./SpreadSheet.css"
import Cell from "./Cell"
import { parseCellInputValue } from "../utils/parse"
const HotFormulaParser = require("hot-formula-parser").Parser

export interface CellIndex {
  rowIdx: number
  colIdx: number
}

export interface ICellData {
  value: number | string
}

export interface SpreadSheetProps {
  data: ICellData[][]
  onChange: React.Dispatch<React.SetStateAction<ICellData[][]>>
}

export interface ICalculateFormulaRes {
  error: null | string
  result: string | number
}

function SpreadSheet(props: SpreadSheetProps) {
  const [, updateState] = React.useState({})
  const forceUpdate = React.useCallback(() => updateState({}), [])

  const formulaParser = useMemo(() => {
    return new HotFormulaParser()
  }, [])

  const tableRef = useRef<HTMLTableElement>(null)
  const setData = props.onChange
  const [selectedCell, setSelectedCell] = useState<null | CellIndex>(null)
  const [isEditting, setIsEditting] = useState<boolean>(false)
  let numCol = 26
  let numRow = 50

  useEffect(() => {
    // TODO: are there better ways?
    // We need to synchronize when the user is editting a cell being refered by another cell,
    // they should update at the same time.
    // the reason formula cell's data state "lags behind one state" of original cell without forceUpdate is because,
    // when data state change, formulaParser hasn't register the new callCellValue listener yet.
    // therefore we add a forceUpdate whenever the data state changes
    forceUpdate()

    const currentCell = formulaParser.currentCell

    formulaParser.on("callCellValue", (cellCoord: any, done: any) => {
      const rowIdx = cellCoord.row.index
      const colIdx = cellCoord.column.index

      // TODO: error handling
      if (rowIdx > numRow || colIdx > numCol) {
        throw new Error("Error - Out of Range")
      }
      if (rowIdx === currentCell?.rowIdx && colIdx === currentCell?.colIdx) {
        throw new Error("Error - Self-referencing")
      }
      if (!props.data[rowIdx] || !props.data[rowIdx][colIdx]) {
        return done("")
      }
      done(props.data[rowIdx][colIdx].value)
    })

    formulaParser.on(
      "callRangeValue",
      (startCellCoord: any, endCellCoord: any, done: any) => {
        const fragment = []
        const startRowIdx = startCellCoord.row.index
        const startColIdx = startCellCoord.column.index
        const endRowIdx = endCellCoord.row.index
        const endColIdx = endCellCoord.column.index
        // TODO: Add error handler
        for (let row = startRowIdx; row <= endRowIdx; row++) {
          const rowData = props.data[row]

          if (!rowData) continue
          const rowFragment = []

          for (let col = startColIdx; col <= endColIdx; col++) {
            if (!rowData[col]) {
              rowFragment.push("")
              continue
            }
            // self referencing
            if (row === currentCell?.rowIdx && col === currentCell?.colIdx) {
              throw new Error("Error - Self-referencing")
            }
            // When cell value is a formula
            if (rowData[col].value.toString().slice(0, 1) === "=") {
              const parseResult = calculateFormula(
                { rowIdx: row, colIdx: col },
                rowData[col].value.toString().slice(1)
              )

              if (parseResult.error !== null) {
                throw new Error(parseResult.error)
              }
              rowFragment.push(parseResult.result)
              continue
            }
            rowFragment.push(rowData[col].value)
          }
          fragment.push(rowFragment)
        }

        if (fragment) {
          done(fragment)
        }
      }
    )
    // tear down event listener
    return () => {
      formulaParser.off("callCellValue")
      formulaParser.off("callRangeValue")
    }
  }, [formulaParser, props.data])

  function handleCellBlur(event: React.FocusEvent) {
    setIsEditting(false)
  }
  function handleCellClick(
    event: React.MouseEvent,
    rowIdx: number,
    colIdx: number
  ) {
    console.log(rowIdx, colIdx)
    // if (selectedCell?.rowIdx !== rowIdx || selectedCell?.colIdx !== colIdx) {
    //   setIsEditting(false)
    // }
    // TODO: if rowIdx and colIdx are same as previous, consider not setting new object state?
    setSelectedCell((prevSelected) => {
      if (prevSelected?.rowIdx === rowIdx && prevSelected?.colIdx === colIdx) {
        return prevSelected
      }
      return { rowIdx: rowIdx, colIdx: colIdx }
    })

    // handle double click
    if (event.detail === 2) {
      setIsEditting(true)
    }
  }

  function handleCellChange(
    event: React.ChangeEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) {
    // if the editted cell is out of range of the provided data, expand the data and fill in the correct values
    setData((prevData) => {
      const rowLength = Math.max(rowIdx + 1, prevData.length)
      const colLength = Math.max(colIdx + 1, prevData[0].length)
      const newData = new Array(rowLength).fill(null).map((_, newRowIdx) => {
        return new Array(colLength).fill(null).map((_, newColIdx) => {
          if (rowIdx === newRowIdx && colIdx === newColIdx) {
            return {
              value: parseCellInputValue(event.target.value)
            }
          }
          if (prevData[newRowIdx]?.[newColIdx]) {
            return prevData[newRowIdx][newColIdx]
          }
          return {
            value: ""
          }
        })
      })
      return newData
    })
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    // TODO: number key does not trigger keydown event for some reason
    // TODO: when selected cell is out of view, we should focus on the selected cell and scroll into view
    // TODO: perhaps handleKEyDown should be attached on each cell? Cell can be focus and scroll into view
    console.log("key", event.code)
    if (!selectedCell) return
    if (isEditting && event.code === "Enter") {
      event.preventDefault()
      setIsEditting(false)
      setSelectedCell({
        rowIdx: Math.min(selectedCell?.rowIdx + 1, numRow - 1),
        colIdx: selectedCell?.colIdx
      })

      // Pressing enter cause table to be out of focus, so we need to set it focus
      if (tableRef && tableRef.current) {
        tableRef.current.focus()
      }
      return
    }
    if (
      !isEditting &&
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
    ) {
      event.preventDefault()
      switch (event.code) {
        case "ArrowUp":
          setSelectedCell({
            rowIdx: Math.max(selectedCell?.rowIdx - 1, 0),
            colIdx: selectedCell?.colIdx
          })
          return
        case "ArrowDown":
          setSelectedCell({
            rowIdx: Math.min(selectedCell?.rowIdx + 1, numRow - 1),
            colIdx: selectedCell?.colIdx
          })
          return
        case "ArrowLeft":
          setSelectedCell({
            rowIdx: selectedCell?.rowIdx,
            colIdx: Math.max(selectedCell?.colIdx - 1, 0)
          })
          return
        case "ArrowRight":
          setSelectedCell({
            rowIdx: selectedCell?.rowIdx,
            colIdx: Math.min(selectedCell?.colIdx + 1, numCol - 1)
          })
          return
      }
    }

    if (!isEditting) {
      setIsEditting(true)
      return
    }
  }

  function calculateFormula(
    cell: CellIndex,
    value: string
  ): ICalculateFormulaRes {
    formulaParser.currentCell = cell
    let parseResult = formulaParser.parse(value)

    if (parseResult.error !== null) {
      return parseResult
    }
    if (parseResult.result.toString().slice(0, 1) === "=") {
      return calculateFormula(cell, parseResult.result.toString().slice(1))
    }
    console.log("paseResule", parseResult)

    return parseResult
  }

  // memoized callback
  const handleClickCallback = useCallback(handleCellClick, [])
  const handleChangeCallback = useCallback(handleCellChange, [setData])
  const calculateFormulaCallback = useCallback(calculateFormula, [])
  const handleBlurCallback = useCallback(handleCellBlur, [])
  return (
    <table
      ref={tableRef}
      className="SpreadSheet"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <colgroup>
        {Array(numCol + 1)
          .fill(null)
          .map((_, idx) => {
            return <col key={idx} className="SpreadSheet__Col"></col>
          })}
      </colgroup>
      <thead>
        <tr>
          {Array(numCol + 1)
            .fill(null)
            .map((_, idx) => {
              if (idx === 0) return <th key={idx}></th>
              return <th key={idx}>{String.fromCharCode(64 + idx)}</th>
            })}
        </tr>
      </thead>
      <tbody>
        {Array(numRow)
          .fill(null)
          .map((_, rowIdx) => (
            // Rows
            <tr key={rowIdx}>
              {Array(numCol + 1)
                .fill(null)
                .map((_, colIdx) => {
                  if (colIdx === 0)
                    return <th key={rowIdx + 1}>{rowIdx + 1}</th>
                  // TODO: refactor cell col idx access
                  const cellValue = props.data?.[rowIdx]?.[colIdx - 1]?.value
                  const isSelected =
                    selectedCell?.rowIdx === rowIdx &&
                    selectedCell?.colIdx === colIdx - 1
                  return (
                    <Cell
                      key={`${rowIdx}_${colIdx - 1}`}
                      rowIdx={rowIdx}
                      colIdx={colIdx - 1}
                      value={
                        cellValue !== null && cellValue !== undefined
                          ? cellValue
                          : ""
                      }
                      selected={isSelected}
                      isEditting={isSelected && isEditting}
                      onClick={handleClickCallback}
                      onChange={handleChangeCallback}
                      onBlur={handleBlurCallback}
                      calculateFormula={calculateFormulaCallback}
                    />
                  )
                })}
            </tr>
          ))}
      </tbody>
    </table>
  )
}

SpreadSheet.whyDidYouRender = true

export default SpreadSheet
