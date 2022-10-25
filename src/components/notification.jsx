import React from 'react';
import { notification } from 'antd';

function notify(type = 'info', message = '', description, url) {
	if (url) {
		description = <a href={url}>{description}</a>;
	}
	notification[type]({
		message,
		description,
		placement: 'bottomLeft',
	});
}

export const notif = {
	success: (...args) => notify('success', ...args),
	info: (...args) => notify('info', ...args),
	warning: (...args) => notify('warning', ...args),
	error: (...args) => notify('error', ...args),
}
