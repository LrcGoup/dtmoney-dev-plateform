import type { SVGProps } from 'react'

type ConnectBrandProps = SVGProps<SVGSVGElement>

export function ConnectBrand(props: ConnectBrandProps) {
  return (
    <svg
      width="168"
      height="32"
      viewBox="0 0 168 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DT Connect API"
      {...props}
    >
      <rect x={2.5} y={6.5} width={5} height={21} rx={2.5} fill="currentColor" />
      <rect x={13.5} y={2} width={5} height={21} rx={2.5} fill="currentColor" />
      <rect x={24.5} y={6.5} width={5} height={21} rx={2.5} fill="currentColor" />
      <circle cx={16} cy={28} r={2.5} fill="currentColor" />
      <text x={42} y={21} fontFamily="Inter, system-ui, sans-serif" fontSize={15} letterSpacing="-0.02em">
        <tspan fill="white" fontWeight={600}>
          DT
        </tspan>
        <tspan fill="#A3A3A3" fontWeight={500}>
          {' '}
          Connect
        </tspan>
      </text>
      <text
        x={125}
        y={20}
        fill="#34D399"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={9}
        fontWeight={700}
        letterSpacing="0.08em"
      >
        API
      </text>
    </svg>
  )
}
