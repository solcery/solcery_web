import './style.scss';

export const BigLoader = (props) => {

  let caption = props.caption ?? 'Loading';
  return <div className='loader'>
    <div className='loader-anim'/>
    <div className='loader-caption'>{caption}</div>
  </div>;
}
