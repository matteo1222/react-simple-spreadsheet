# React Sheet

# Usage

```js
import React, { useState } from "react"
import SpreadSheet from "./lib/SpreadSheet"
import { ICellData } from "./lib/SpreadSheet"
import "./App.css"

function App() {
  const [data, setData] = useState<ICellData[][]>([
    [{ value: 1 }, { value: 2 }],
    [{ value: 2 }, { value: 4 }]
  ])
  return (
    <div className="Container">
      <SpreadSheet data={data} onChange={setData} />
    </div>
  )
}

export default App
```
