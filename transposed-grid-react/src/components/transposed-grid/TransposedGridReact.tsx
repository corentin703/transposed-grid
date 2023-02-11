import React, {Fragment, ReactElement, ReactPortal, useMemo, useState} from "react";
import {TransposedGrid as TransposedGridStencil} from "../stencil-generated";
import type {CustomTemplate, JSX, ToolbarOptions, Row as BaseRow, CellTemplate } from 'transposed-grid';
import {Row} from "./TransposedGridReact.type";
import {mapTemplateRenderFunction} from "../../utils/mapTemplateRenderFunction";
import {createPortal} from "react-dom";
import {ItemTemplate} from "./ItemTemplate";

export type TransposedGridProps =
	& Omit<
			Omit<JSX.TransposedGrid, 'rows'>,
			'toolbarTemplate'
		>
	& {
			toolbarRender?: (props: CustomTemplate<ToolbarOptions>) => ReactElement;
			rows?: Row[];
		}

type CellRenderingState = {
	row: Row;
	element: HTMLElement,
	renderingFunc: (params: CustomTemplate<any>) => ReactElement;
}

export function TransposedGridReact(props: TransposedGridProps) {
	const [toolbarPortal, setToolbarPortal] = useState<ReactPortal | undefined>(undefined)
	const [cellRenderingState, setCellRenderingState] = useState<Record<string, Record<string, CellRenderingState>>>({ })
	const [rowCellsParams, setRowCellsParams] = useState<Record<string, Record<string, CellTemplate>>>({ })

	const toolbarTemplate = useMemo(() => {
		setToolbarPortal(undefined)
		if (!props.toolbarRender || typeof(props.toolbarRender) !== 'function') {
			return undefined
		}

		return mapTemplateRenderFunction(props.toolbarRender, portal => {
			setToolbarPortal(portal)
		})
	}, [props.toolbarRender])

	const rows: BaseRow[] | undefined = useMemo(() => {
		if (!props.rows) {
			return undefined
		}

		const onTrigger = (params: CustomTemplate<any>, renderingFunc: (params: CustomTemplate<any>) => ReactElement) => {
			const itemId = params.data[params.primaryKey];

			setCellRenderingState(cellRenderingState => {
				const updatedCellRenderingState = {
					...cellRenderingState,
				};

				updatedCellRenderingState[params.row.dataField] ??= { };
				updatedCellRenderingState[params.row.dataField][itemId] = {
					row: params.row,
					element: params.element,
					renderingFunc: renderingFunc,
				};

				return updatedCellRenderingState
			});

			setRowCellsParams(rowCellsParams => {
				const updatedRowCellsParams = {
					...rowCellsParams,
				};

				updatedRowCellsParams[params.row.dataField] ??= { };
				updatedRowCellsParams[params.row.dataField][itemId] = params;

				return updatedRowCellsParams
			})
		}

		return props.rows.map(_row => {
			const baseRow: BaseRow = {
				..._row,
				cellRender: undefined,
				editionCellRender: undefined,
			} as BaseRow

			if (_row.cellRender && typeof(_row.cellRender) === 'function') {
				const cellRender = _row.cellRender;
				baseRow.cellTemplate = params => onTrigger(params, cellRender);
			}

			if (_row.editionCellRender && typeof(_row.editionCellRender) === 'function') {
				const editionCellRender = _row.editionCellRender;
				baseRow.editionCellTemplate = params => onTrigger(params, editionCellRender);
			}

			return baseRow
		})
	}, [props.rows])

	const portals = useMemo(() => {
		return Object.keys(cellRenderingState).map((dataField, rowIdx) =>
			<Fragment key={rowIdx}>
				{Object.keys(cellRenderingState[dataField]).map((itemId, cellIdx) => {
					const cellRendering = cellRenderingState[dataField][itemId];
					const renderParams = rowCellsParams[dataField][itemId];

					return (
						<Fragment key={cellIdx}>
							{createPortal(
								<ItemTemplate templateProps={renderParams} render={cellRendering.renderingFunc} />,
								cellRendering.element
							)}
						</Fragment>
					)
				})}
			</Fragment>
		)
	}, [cellRenderingState, rowCellsParams])

	return (
		<>
			<TransposedGridStencil
				{...props}
				toolbarTemplate={toolbarTemplate}
				rows={rows}
			/>
			{toolbarPortal}
			{portals}
		</>
	)
}
