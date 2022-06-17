import { useEffect } from 'react';
import { Switch } from 'antd';

export const ValueRender = (props) => {
	useEffect(() => {
		if (props.isFilter && props.onChange)
		props.onChange(false);
	}, [ props.isFilter, props.onChange ]);

	if (!props.onChange) return <p>{props.defaultValue ? 'True' : 'False'}</p>;

	return <Switch defaultChecked={props.defaultValue} onChange={props.onChange} />;
};
