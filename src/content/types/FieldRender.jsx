import { useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

export const FieldRender = (props) => {
	const containerRef = useRef();
	const { fieldPath } = useParams();

	const autoScroll = () => {
		if (!containerRef.current) return;
		containerRef.current.scrollIntoView({
			block: 'center',
			behavior: 'smooth'
		});
	}

	useEffect(() => {
		if (!props.path) return;
		if (props.path.join('.') !== fieldPath) return;
		setTimeout(autoScroll, 100);
	}, [ props.autoScroll, props.path ])

	// TODO: blink
	return <div ref={containerRef}> 
		<props.type.valueRender 
			{...props}
		/>
	</div>
}