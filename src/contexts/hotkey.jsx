import React, { useContext, useEffect, useState, useCallback } from 'react';

export const hotkeys = ['Ctrl+KeyC', 'Ctrl+KeyS', 'Escape', 'Ctrl+KeyV'];

const HotkeyContext = React.createContext(undefined);

export function HotkeyProvider(props) {
	const [listeners, setListeners] = useState();

	useEffect(() => {
		let l = {};
		for (let hotkey of hotkeys) {
			l[hotkey] = {
				subscriptions: 0,
				callbacks: [],
			};
		}
		setListeners(l);
	}, []);

	const handle = (hotkey, e) => {
		if (!listeners) return;
		if (hotkeys.indexOf(hotkey) < 0) return;
		let callbacks = listeners[hotkey].callbacks;
		if (callbacks.length === 0) return;
		let subscription = callbacks[callbacks.length - 1];
		if (subscription.noDefault) {
			e.preventDefault();
		}
		subscription.callback();
	};

	const addHotkey = useCallback(
		(data) => {
			if (!listeners) return;
			let id = listeners[data.key].subscriptions++;
			listeners[data.key].callbacks.push(Object.assign({ id }, data));
			return id;
		},
		[listeners]
	);

	const removeHotkey = useCallback(
		(hotkey, id) => {
			if (id === undefined) return;
			if (!listeners) return;
			let list = listeners[hotkey].callbacks;
			let index = list.findIndex((sub) => sub.id === id);
			if (index >= 0) {
				list.splice(index, 1);
			}
		},
		[listeners]
	);

	useEffect(() => {
		const onKeyDown = (e) => {
			let key = e.code;
			if (e.ctrlKey || e.metaKey) key = 'Ctrl+' + key;
			handle(key, e);
		};
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	return (
		<HotkeyContext.Provider value={{ addHotkey, removeHotkey }}>
			{props.children}
		</HotkeyContext.Provider>
	);
}

export function useHotkeyContext() {
	const { addHotkey, removeHotkey } = useContext(HotkeyContext);
	return { addHotkey, removeHotkey };
}

export const useHotkey = (data, callback) => {
	const { addHotkey, removeHotkey } = useContext(HotkeyContext);
	useEffect(() => {
		let hotkey = typeof data === 'string' ? { key: data } : data;
		hotkey.callback = callback;
		let id = addHotkey(hotkey);
		return () => {
			removeHotkey(hotkey.key, id);
		};
	}, [data, callback, addHotkey, removeHotkey]);
	return callback;
};
