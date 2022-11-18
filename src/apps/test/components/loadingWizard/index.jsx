import './style.scss';

export const LoadingWizard = () => <>
  <div className='scene'>
    <div className='objects'>
      <div className='square'/>
      <div className='circle'/>
      <div className='triangle'/>
    </div>
    <div className='wizard'>
      <div className='body'/>
      <div className='right-arm'>
        <div className='right-hand'/>
      </div>
      <div className='left-arm'>
        <div className='left-hand'/>
      </div>
       <div className='head'>
        <div className='beard'/>
        <div className='face'>
          <div className='adds'/>
        </div>
        <div className='hat'>
          <div className='hat-of-the-hat'/>
          <div className='four-point-star --first'/>
          <div className='four-point-star --second'/>
          <div className='four-point-star --third'/>
        </div>
      </div>
    </div>
  </div>
  <div className='progress'/>
  <div className='noise'/>
</>


// .scene
//   .objects
//     .square
//     .circle
//     .triangle
//   .wizard
//     .body
//     .right-arm
//       .right-hand
//     .left-arm
//       .left-hand
//     .head
//       .beard
//       .face
//         .adds
//       .hat
//         .hat-of-the-hat
//         .four-point-star(class="--first")
//         .four-point-star(class="--second")
//         .four-point-star(class="--third")
  
// .progress

// .noise