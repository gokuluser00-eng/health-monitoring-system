import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RiskBadge({ level = "Low Risk", score = null, size = "md" }) {
  const normLevel = (level || "Low Risk").toLowerCase();
  
  let badgeClass = "badge-low";
  let pulseClass = "pulse-green";
  let Icon = CheckCircle;

  if (normLevel.includes("high") || normLevel.includes("critical")) {
    badgeClass = "badge-high";
    pulseClass = "pulse-red";
    Icon = ShieldAlert;
  } else if (normLevel.includes("mod") || normLevel.includes("warning")) {
    badgeClass = "badge-mod";
    pulseClass = "pulse-amber";
    Icon = AlertTriangle;
  }

  const isSmall = size === "sm";

  return (
    <span className={`badge ${badgeClass}`} style={{ fontSize: isSmall ? '0.7rem' : '0.8rem', padding: isSmall ? '0.15rem 0.5rem' : '0.3rem 0.75rem' }}>
      <span className={`pulse-indicator ${pulseClass}`}></span>
      <Icon size={isSmall ? 12 : 14} />
      <span>{level}</span>
      {score !== null && <span style={{ opacity: 0.85, fontWeight: 700 }}>({score}%)</span>}
    </span>
  );
}
