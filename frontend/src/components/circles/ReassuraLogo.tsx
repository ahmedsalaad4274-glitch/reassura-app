import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';

interface Props {
  size?: number;
  strokeColor?: string;
}

export const ReassuraLogo: React.FC<Props> = ({
  size = 38,
  strokeColor = 'rgba(255,255,255,0.88)',
}) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Path
      d="M60 7C41 7 27 21 27 40c0 25 33 71 33 71S93 65 93 40C93 21 79 7 60 7Z"
      fill="none" stroke={strokeColor} strokeWidth={2.5}
    />
    <Path
      d="M60 56S43 45.5 43 34.5C43 27.5 48.5 23 54 23c3.2 0 5.3 1.9 6 4.2.7-2.3 2.8-4.2 6-4.2C71.5 23 77 27.5 77 34.5 77 45.5 60 56 60 56Z"
      fill="none" stroke={strokeColor} strokeWidth={2}
    />
    <Polyline points="53,39 60,33 67,39" fill="none" stroke={strokeColor} strokeWidth={1.5} />
    <Polyline points="55,39 55,48 65,48 65,39" fill="none" stroke={strokeColor} strokeWidth={1.5} />
    <Polyline points="58,48 58,43 62,43 62,48" fill="none" stroke={strokeColor} strokeWidth={1.5} />
  </Svg>
);
