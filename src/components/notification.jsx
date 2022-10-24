import React from 'react';
import { notification } from 'antd';
import { Link } from 'react-router-dom';

function notify(type = 'info', message = '', description, url) {
	if (url) {
		description = <Link to={url}>{description}</Link>;
	}
	notification[type]({
		message,
		description,
		placement: 'bottomLeft',
	});
}

export const notif = {
	success: (...args) => notify('success', ...args),
	warning: (...args) => notify('warning', ...args),
	error: (...args) => notify('error', ...args),
}
