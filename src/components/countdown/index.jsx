import { useRef, useEffect } from 'react';
import './style.scss';

const circumference = 2 * Math.PI * 48;

export const Countdown = (props) => {
	const circleRef = useRef();
	const numberRef = useRef();

	const seconds = useRef();

	const update = (value) => {
		let total = props.total;
		if (circleRef.current) {
			circleRef.current.style.strokeDashoffset = ((total - value) / total) * circumference
		}
		if (numberRef.current) {
			numberRef.current.innerHTML = value;
		}
	}

	const tick = () => {
		if (!seconds.current) return;
		if (seconds.current >= 0) {
			seconds.current = seconds.current - 1;
			update(seconds.current);
		}
	}

	useEffect(() => {
		if (circleRef.current) {
			circleRef.current.style.strokeDasharray = circumference;
		}
	}, []);

	useEffect(() => {
		if (!props.total) return;
		seconds.current = props.current ?? seconds.current;
		update(props.current);
		let interval = setInterval(() => tick(), 1000);
		return () => clearInterval(interval);
	}, [ props.total, props.current ]);

	return <div className='countdown-container'>
		<div className='countdown'>
			<svg viewBox="0 0 100 100" className="timer">
		        <circle className="progress-frame" cx="50" cy="50" r="48"></circle>
		        <circle ref={circleRef} className="progress" cx="50" cy="50" r="48"></circle>
		    </svg>

		    <div className="time">
		        <p ref={numberRef} className="seconds">{props.total}</p>
		    </div>
	    </div>
	    <div className='caption'>
	    	{props.caption}
	    </div>
    </div>
}