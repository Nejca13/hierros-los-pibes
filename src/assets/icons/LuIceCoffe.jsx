const LuIceCoffe = ({
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
    <path d='m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8'></path>
    <path d='M5 8h14'></path>
    <path d='M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0'></path>
    <path d='m12 8 1-6h2'></path>
  </svg>
)

export default LuIceCoffe
