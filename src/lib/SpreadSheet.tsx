import React from "react"
import "./SpreadSheet.css"

function SpreadSheet() {
  let numCol = 26
  let numRow = 50
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
                  return <td key={colIdx}></td>
                })}
            </tr>
          ))}
      </tbody>
    </table>
  )
}

export default SpreadSheet
