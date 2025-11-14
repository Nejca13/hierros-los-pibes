const LuMenuSquare = ({
  width = '24',
  height = '24',
  color = 'var(--marron)',
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
    <line x1='4' x2='20' y1='12' y2='12'></line>
    <line x1='4' x2='20' y1='6' y2='6'></line>
    <line x1='4' x2='20' y1='18' y2='18'></line>
  </svg>
)

export default LuMenuSquare
