const MIN_ROW_HEIGHT = 30
const MIN_HEADER_WIDTH = 60
const MIN_ROW_WIDTH = 100


const CELL_HEADER_CLASS_LIST = [
  'cell__toolbar_header'
]

const getStyleDivId = (tableId: string, dataField?: string) => {
  if (!dataField) {
    return `transposed-table-${tableId}`
  }

  return `transposed-table-${tableId}-${dataField}`
}
const getHeaderClassName = (tableId: string, dataField: string) => `${tableId}-header-${dataField}`
const getRowClassName = (tableId: string, dataField: string) => `${tableId}-row-${dataField}`

export function adjustRowsSize(table: HTMLTableElement, tableId: string, dataFields: string[]): () => void {
  const destructors = dataFields.map(dataField => adjustRowsHeight(tableId, dataField))
  destructors.push(
    adjustRowsWidth(table, tableId, dataFields)
  )

  return () => destructors.forEach(destructor => destructor())
}

// Height: headers, rows
// Width:

export function adjustRowsHeight(tableId: string, dataField: string): () => void {
  const styleDivId = getStyleDivId(tableId, dataField)
  const headerClassName = getHeaderClassName(tableId, dataField)
  const rowsClassName = getRowClassName(tableId, dataField)

  const styleDiv = document.createElement('style')
  styleDiv.id = styleDivId
  document.body.appendChild(styleDiv);

  // @ts-ignore
  const rowsCells = [...document.getElementsByClassName(rowsClassName)] as HTMLTableCellElement[]

  const observer = new ResizeObserver(() => {
    const maxHeight = Math.max(...rowsCells.map(cell => cell.scrollHeight))

    if (maxHeight >= MIN_ROW_HEIGHT) {
      const maxHeightStyleValue = `${maxHeight + 1}px`

      styleDiv.innerHTML = `
				.${headerClassName}:not(.hidden), .${rowsClassName}:not(.hidden) {
					min-height: ${maxHeightStyleValue};
					height: ${maxHeightStyleValue};
				}
			`
    }
  })

  rowsCells.forEach(cell => observer.observe(cell))

  return () => {
    rowsCells.forEach(cell => observer.unobserve(cell))
    observer.disconnect()
    styleDiv.remove()
  }
}

export function adjustRowsWidth(table: HTMLTableElement, tableId: string, dataFields: string[]): () => void {
  const headerStyleDivId = `${getStyleDivId(tableId)}-header`
  const cellStyleDivId = `${getStyleDivId(tableId)}-cell`

  const headerStyleDiv = document.createElement('style')
  headerStyleDiv.id = headerStyleDivId
  document.body.appendChild(headerStyleDiv);

  const cellsStyleDiv = document.createElement('style')
  cellsStyleDiv.id = cellStyleDivId
  document.body.appendChild(cellsStyleDiv);

  const headerClassNames: string[] = []
  const groupHeaderClassNames: string[] = []
  const headersCells: HTMLTableCellElement[] = []

  const rowsClassNames: string[] = []
  const rowsCells: HTMLTableCellElement[] = []

  dataFields.forEach(dataField => {
    const headerClassName = getHeaderClassName(tableId, dataField)

    const rowClassName = getRowClassName(tableId, dataField)
    rowsClassNames.push(rowClassName)

    const dataFieldCells = [
      // @ts-ignore
      ...document.getElementsByClassName(rowClassName)
    ] as HTMLTableCellElement[]
    rowsCells.push(...dataFieldCells as HTMLTableCellElement[])

    if (dataField === 'group') {
      groupHeaderClassNames.push(headerClassName)
    } else {
      headerClassNames.push(headerClassName)
    }

    const headerCell = document.getElementsByClassName(headerClassName)?.item(0) as HTMLTableCellElement | undefined
    if (headerCell) {
      headersCells.push(headerCell)
    }
  })

  let lastHeaderMaxWidth: number = MIN_HEADER_WIDTH
  let lastCellsMaxWidth: number = MIN_ROW_WIDTH

  const observer = new ResizeObserver(() => {
    const safeHeaderCells = headersCells
      .filter(cell =>
        !CELL_HEADER_CLASS_LIST.some(blacklisted => cell.className.includes(blacklisted))
      )

    const maxHeaderWidth = Math.max(...safeHeaderCells.map(cell => cell.clientWidth))

    if (maxHeaderWidth >= lastHeaderMaxWidth) {
      lastHeaderMaxWidth = maxHeaderWidth
      headerStyleDiv.innerHTML = ''

      const maxWidthStyleValue = `${maxHeaderWidth}px`

      headerClassNames.forEach(headerClassName => {
        headerStyleDiv.innerHTML += `
					.${headerClassName}:not(.hidden), .${tableId}-header {
						min-width: ${maxWidthStyleValue} !important;
						width: ${maxWidthStyleValue} !important;
						max-width: ${maxWidthStyleValue} !important;
					}
				`
      })

      const tBodyFullWidth = rowsCells.map(cell => cell.scrollWidth).reduce((partialSum, width) => partialSum + width, 0) / dataFields.length

      if (table.clientWidth <= tBodyFullWidth) {
        groupHeaderClassNames.forEach(headerClassName => {
          headerStyleDiv.innerHTML += `
						.${headerClassName}:not(.hidden) {
							width: ${maxWidthStyleValue} !important;
							max-width: ${maxWidthStyleValue} !important;
						}
					`
        })
      } else {
        groupHeaderClassNames.forEach(headerClassName => {
          headerStyleDiv.innerHTML += `
						.${headerClassName}:not(.hidden), .${tableId}-item {
							width: ${maxWidthStyleValue} !important;
							max-width: ${maxWidthStyleValue} !important;
						}
					`
        })
      }


    }

    const maxCellsWidth = Math.max(...rowsCells.map(cell => cell.scrollWidth))
    if (maxCellsWidth >= lastCellsMaxWidth) {
      lastCellsMaxWidth = maxCellsWidth
      cellsStyleDiv.innerHTML = ''

      const maxWidthStyleValue = `${maxCellsWidth}px`

      rowsClassNames.forEach(rowClassName => {
        cellsStyleDiv.innerHTML += `
					.${rowClassName}:not(.hidden) {
						min-width: ${maxWidthStyleValue};
						width: ${maxWidthStyleValue};
					}
				`
      })
    }
  })

  rowsCells.forEach(cell => observer.observe(cell))

  return () => {
    rowsCells.forEach(cell => observer.unobserve(cell))
    observer.disconnect()
    headerStyleDiv.remove()
    cellsStyleDiv.remove()
  }
}
