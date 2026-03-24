import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from '@mui/x-charts/Gauge';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';

// ---------------- SMOOTH ANIMATION HOOK ----------------
function useGaugeAnimation(target: number, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);

      // 🔥 smooth easing (VERY IMPORTANT)
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // ❌ NO Math.floor (this was your problem)
      setValue(ease * target);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

// ---------------- POINTER ----------------
function GaugePointer({ isPositive }: { isPositive: boolean }) {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) return null;

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      {/* Glow */}
      <circle cx={cx} cy={cy} r={10} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={6} opacity={0.3} />
      <circle cx={cx} cy={cy} r={6} fill={isPositive ? '#22c55e' : '#ef4444'} />

      {/* Needle */}
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

// ---------------- WRAPPER ----------------
const GaugeWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
}));

// ---------------- MAIN ----------------
interface Props {
  value: number;
  width?: number;
  height?: number;
}

export default function PersonalityGauge({
  value,
  width = 260,
  height = 260,
}: Props) {
  const isPositive = value >= 0;
  const absValue = Math.abs(value);

  // 🔥 smooth animated value
  const animatedValue = useGaugeAnimation(absValue, 1500);

  return (
    <GaugeWrapper>
      <GaugeContainer
        width={width}
        height={height}
        startAngle={-110}
        endAngle={110}
        value={animatedValue} // 🔥 THIS DRIVES ANIMATION
      >
        <GaugeReferenceArc />
        <GaugeValueArc
          sx={{
            transition: 'none', // ❌ remove fake transition
          }}
          fill={isPositive ? 'success.main' : 'error.main'}
        />
        <GaugePointer isPositive={isPositive} />
      </GaugeContainer>

      {/* VALUE DISPLAY */}
      <div>
        <div
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: isPositive ? '#22c55e' : '#ef4444',
          }}
        >
          {value > 0 ? `+${Math.round(animatedValue)}` : Math.round(animatedValue)}
        </div>

        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Score Change
        </div>
      </div>
    </GaugeWrapper>
  );
}