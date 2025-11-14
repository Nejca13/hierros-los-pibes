import React from 'react'

const Hamburguer = ({
  width = '35px',
  height = '35px',
  color = 'white',
  showMenu,
}) => {
  return (
    <svg
      stroke={color}
      fill='none'
      strokeWidth={1.5}
      viewBox='0 0 24 24'
      strokeLinecap='round'
      strokeLinejoin='round'
      height={height}
      width={width}
      xmlns='http://www.w3.org/2000/svg'
      className={showMenu ? 'open' : ''}
      style={{ transition: '0.3s ease' }}
    >
      <line
        x1={4}
        x2={20}
        y1={6}
        y2={6}
        style={{
          transformOrigin: 'center',
          transition: '0.3s ease',
          transform: showMenu ? 'rotate(45deg) translateY(6px)' : 'none',
        }}
      />
      <line
        x1={4}
        x2={20}
        y1={12}
        y2={12}
        style={{
          transition: '0.3s ease',
          opacity: showMenu ? 0 : 1,
        }}
      />
      <line
        x1={4}
        x2={20}
        y1={18}
        y2={18}
        style={{
          transformOrigin: 'center',
          transition: '0.3s ease',
          transform: showMenu ? 'rotate(-45deg) translateY(-6px)' : 'none',
        }}
      />
    </svg>
  )
}

export default Hamburguer
