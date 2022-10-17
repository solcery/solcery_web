import React from 'react';
import { notification } from 'antd';

export function notify ({
	message = '',
	description = undefined,
	txid = '',
	url = '',
	type = 'info',
	placement = 'bottomLeft',
}) {
	if (url) {
		description = <a href={url}>{description}</a>;
	}
	notification[type]({
		message,
		description,
		placement,
	});
}
