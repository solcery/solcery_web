import { useEffect } from 'react';
import { Switch } from 'antd';

export const ValueRender = (props) => {
	useEffect(() => {
		if (props.isFilter && props.onChange) props.onChange(false);
	}, [props, props.isFilter, props.onChange]);

	if (!props.onChange) return <>{props.defaultValue ? 'True' : 'False'}</>;

	return <Switch defaultChecked={props.defaultValue} onChange={props.onChange} />;
};
