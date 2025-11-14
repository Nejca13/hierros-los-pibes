const LuCoffe = ({
  width = '24',
  height = '24',
  color = 'white',
  className = '',
}) => (
  <svg
    stroke={color}
    fill='none'
    strokeWidth='1.8'
    viewBox='0 0 24 24'
    strokeLinecap='round'
    strokeLinejoin='round'
    height={height}
    width={width}
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <path d='M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1'></path>
    <path d='M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2'></path>
    <path d='M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2'></path>
    <path d='M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z'></path>
    <path d='M16.746 16.726a3 3 0 1 0 .252 -5.555'></path>
  </svg>
)

export default LuCoffe
