import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts/Gauge';
import { alpha } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

interface PersonalityGaugeProps {
  value: number;
  width?: number;
  height?: number;
}

function GaugePointer({ isPositive }: { isPositive: boolean }) {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();
  const arcLength = useGaugeState().arcLength || 1;

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      {/* Animated pointer glow */}
      <circle cx={cx} cy={cy} r={12} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={8} opacity={0.3} strokeOpacity={arcLength} />
      <circle cx={cx} cy={cy} r={8} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={6} opacity={0.6} strokeOpacity={arcLength} />
      <circle cx={cx} cy={cy} r={6} fill={isPositive ? '#22c55e' : '#ef4444'} strokeOpacity={arcLength} />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth={4}
        strokeLinecap="round"
        strokeOpacity={arcLength}
      />
    </g>
  );
}

const GaugeWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
}));

export default function PersonalityGauge({ value, width = 250, height = 250 }: PersonalityGaugeProps) {
  const isPositive = value >= 0;
  const absValue = Math.abs(value);

  return (
    <GaugeWrapper>
      <GaugeContainer
        width={width}
        height={height}
        startAngle={-110}
        endAngle={110}
        value={absValue}
        animation={{
          duration: 1500,
          easing: 'easeInOut',
        }}
      >
        <GaugeReferenceArc />
        <GaugeValueArc
          fill={isPositive ? 'success.main' : 'error.main'}
        />
        <GaugePointer isPositive={isPositive} />
      </GaugeContainer>
      <div style={{ animation: 'pulse 2s infinite', opacity: 1 }}>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: isPositive ? '#22c55e' : '#ef4444',
          textShadow: '0 0 10px currentColor'
        }}>
          {value > 0 ? `+${value}` : value}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Score Change</div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </GaugeWrapper>
  );
}
