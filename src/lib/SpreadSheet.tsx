import React, { useState } from "react"
import "./SpreadSheet.css"
import Cell from "./Cell"
import { parseCellInputValue } from "../utils/parse"

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

function SpreadSheet(props: SpreadSheetProps) {
  const setData = props.onChange
  const [selectedCell, setSelectedCell] = useState<null | CellIndex>(null)
  const [isEditting, setIsEditting] = useState<boolean>(false)
  let numCol = 26
  let numRow = 50

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
  return (
    <table className="SpreadSheet">
      <thead>
        <tr>
          {Array(numCol + 1)
            .fill(null)
            .map((_, idx) => {
              if (idx === 0) return <th></th>
              return <th key={idx}>{String.fromCharCode(64 + idx)}</th>
            })}
        </tr>
      </thead>
      <tbody>
        {Array(numRow)
          .fill(null)
          .map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array(numCol + 1)
                .fill(null)
                .map((_, colIdx) => {
                  if (colIdx === 0) return <th>{rowIdx + 1}</th>
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
