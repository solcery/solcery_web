import { useRef, useEffect } from 'react';
import './style.scss';

const circumference = 2 * Math.PI * 48;

export const Countdown = (props) => {
	const circleRef = useRef();
	const numberRef = useRef();
	const seconds = useRef(props.total);

	const update = () => {
		if (!seconds.current) return;
		if (seconds.current >= 0) {
			seconds.current = seconds.current - 1;
			let total = props.total;
			let current = seconds.current;
			if (circleRef.current) {
				circleRef.current.style.strokeDashoffset = ((total - current) / total) * circumference
			}
			if (numberRef.current) {
				numberRef.current.innerHTML = current;
			}
		}
	}

	useEffect(() => {
		let interval = setInterval(() => update(), 1000);
		if (circleRef.current) {
			circleRef.current.style.strokeDasharray = circumference;
		}
		return () => clearInterval(interval);
	}, []);

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