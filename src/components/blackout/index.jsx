import './style.scss'

export const Blackout = (props) => {
	return <div className='blackout fade-in'>
        <div className='blackout-container'>
            {props.header && <>
                <div className='blackout-header'>
                    {props.header}
                </div>
                <span className='blackout-header-underline'/>
            </>}
            {props.message && <div className='blackout-message'>
                {props.message}
            </div>}
            {props.children}
            
        </div>
    </div>
}