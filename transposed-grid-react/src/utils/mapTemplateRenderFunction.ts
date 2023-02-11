import {ReactElement, ReactPortal} from "react";
import {createPortal} from "react-dom";
import { CustomTemplate } from "transposed-grid";

export function mapTemplateRenderFunction<TContext>(
	renderFunc: (params: CustomTemplate<TContext>) => ReactElement,
	onCreatePortal: (portal: ReactPortal, params: CustomTemplate<TContext>) => void
) {
	return (params: CustomTemplate<TContext>) => {
		const portal = createPortal(
			renderFunc(params),
			params.element
		);

		onCreatePortal(portal, params);
	}
}