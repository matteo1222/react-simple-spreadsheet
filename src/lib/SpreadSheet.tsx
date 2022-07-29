import React, { useState, useRef, useEffect, useMemo } from "react"
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
  const formulaParser = useMemo(() => {
    return new HotFormulaParser()
  }, [HotFormulaParser])

  const tableRef = useRef<HTMLTableElement>(null)
  const setData = props.onChange
  const [selectedCell, setSelectedCell] = useState<null | CellIndex>(null)
  const [isEditting, setIsEditting] = useState<boolean>(false)
  let numCol = 26
  let numRow = 50

  useEffect(() => {
    console.log("gogo parser", props.data)
    // define FormulaParser's hook logic, refering label such as A1
    formulaParser.on("callCellValue", (cellCoord: any, done: any) => {
      const rowIdx = cellCoord.row.index
      const colIdx = cellCoord.column.index

      // TODO: error handling
      if (rowIdx > numRow || colIdx > numCol) {
        throw new Error("Error - Out of Range")
      }
      if (rowIdx === selectedCell?.rowIdx && colIdx === selectedCell?.colIdx) {
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
            // When cell value is a formula
            if (rowData[col].value.toString().slice(0, 1) === "=") {
              rowFragment.push(
                calculateFormula(rowData[col].value.toString().slice(1)).result
              )
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

  function handleCellClick(
    event: React.MouseEvent,
    rowIdx: number,
    colIdx: number
  ) {
    console.log(rowIdx, colIdx)
    if (selectedCell?.rowIdx !== rowIdx || selectedCell?.colIdx !== colIdx) {
      setIsEditting(false)
    }
    setSelectedCell({
      rowIdx: rowIdx,
      colIdx: colIdx
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
    // TODO: refactor, not every cell will need to rerender when a cell is being editted
    // if the editted cell is out of range of the provided data, expand the data and fill in the correct values
    const rowLength = Math.max(rowIdx + 1, props.data.length)
    const colLength = Math.max(colIdx + 1, props.data[0].length)
    const newData = new Array(rowLength).fill(null).map((_, newRowIdx) => {
      return new Array(colLength).fill(null).map((_, newColIdx) => {
        if (rowIdx === newRowIdx && colIdx === newColIdx) {
          return {
            value: parseCellInputValue(event.target.value)
          }
        }
        if (props.data[newRowIdx]?.[newColIdx]) {
          return props.data[newRowIdx][newColIdx]
        }
        return {
          value: ""
        }
      })
    })
    setData(newData)
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

  function calculateFormula(value: string): ICalculateFormulaRes {
    let parseResult = formulaParser.parse(value)

    if (parseResult.error !== null) {
      return parseResult
    }
    if (parseResult.result.toString().slice(0, 1) === "=") {
      return calculateFormula(parseResult.result.toString().slice(1))
    }
    console.log("paseResule", parseResult)

    return parseResult
  }
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
                      selected={
                        selectedCell?.rowIdx === rowIdx &&
                        selectedCell?.colIdx === colIdx - 1
                      }
                      isEditting={isEditting}
                      onClick={handleCellClick}
                      onChange={handleCellChange}
                      calculateFormula={calculateFormula}
                    />
                  )
                })}
            </tr>
          ))}
      </tbody>
    </table>
  )
}

export default SpreadSheet
