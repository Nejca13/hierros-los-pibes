const LuIceCream = ({
  width = '24',
  height = '24',
  color = 'white',
  className = '',
}) => (
  <svg
    stroke={color}
    fill='none'
    strokeWidth='2'
    viewBox='0 0 24 24'
    strokeLinecap='round'
    strokeLinejoin='round'
    height={height}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path d='M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6m-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0'></path>
    <path d='M12.14 11a3.5 3.5 0 1 1 6.71 0'></path>
    <path d='M15.5 6.5a3.5 3.5 0 1 0-7 0'></path>
  </svg>
)

export default LuIceCream
