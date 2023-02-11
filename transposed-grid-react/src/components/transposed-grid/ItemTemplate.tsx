import React from "react";
import { CellTemplate } from "transposed-grid"
import {ReactElement, useMemo} from "react";

export type ItemTemplateProps = {
	templateProps: CellTemplate;
	render: (props: CellTemplate) => ReactElement;
}

export function ItemTemplate(props: ItemTemplateProps) {

	const content = useMemo(() => {
		return props.render(props.templateProps);
	}, [props.templateProps, props.render])

	return (
		<>
			{content}
		</>
	)
}
