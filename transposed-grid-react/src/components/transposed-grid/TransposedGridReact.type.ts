import type {CustomTemplate, CellTemplate, Row as StencilRow, EditCellTemplate } from 'transposed-grid';
import {ReactElement} from "react";

export type Row =
	& Omit<
			Omit<StencilRow, 'cellTemplate'>,
			'editionCellTemplate'
		>
	& {
			cellRender?: (props: CustomTemplate<CellTemplate>) => ReactElement
			editionCellRender?: (props: CustomTemplate<EditCellTemplate>) => ReactElement
		}
