import React from 'react';
import { UrgencyLevel, CaseStatus, NeedStatus } from '../types';

interface BadgeProps {
  type: 'urgency' | 'status' | 'needStatus';
  value: UrgencyLevel | CaseStatus | NeedStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className = '' }) => {
  let colorStyle = 'bg-slate-100 text-slate-800';
  let label = String(value);

  if (type === 'urgency') {
    switch (value) {
      case 'critica':
        colorStyle = 'bg-red-100 text-red-800 border border-red-300 font-bold animate-pulse';
        label = 'Crítica';
        break;
      case 'alta':
        colorStyle = 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold';
        label = 'Alta';
        break;
      case 'media':
        colorStyle = 'bg-blue-100 text-blue-800 border border-blue-200';
        label = 'Media';
        break;
      case 'baja':
        colorStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        label = 'Baja';
        break;
    }
  } else if (type === 'status') {
    switch (value) {
      case 'borrador':
        colorStyle = 'bg-slate-100 text-slate-700';
        label = 'Borrador';
        break;
      case 'enviado':
        colorStyle = 'bg-purple-100 text-purple-800';
        label = 'Enviado';
        break;
      case 'en_revision':
        colorStyle = 'bg-amber-100 text-amber-800';
        label = 'En Revisión';
        break;
      case 'verificado':
        colorStyle = 'bg-teal-100 text-teal-800 border border-teal-300';
        label = 'Verificado';
        break;
      case 'publicado':
        colorStyle = 'bg-indigo-100 text-indigo-800 border border-indigo-300';
        label = 'Publicado';
        break;
      case 'parcialmente_asignado':
        colorStyle = 'bg-sky-100 text-sky-800';
        label = 'Parcialmente Asignado';
        break;
      case 'parcialmente_atendido':
        colorStyle = 'bg-cyan-100 text-cyan-800';
        label = 'Parcialmente Atendido';
        break;
      case 'atendido':
        colorStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-400 font-semibold';
        label = 'Atendido';
        break;
      case 'rechazado':
        colorStyle = 'bg-rose-100 text-rose-800';
        label = 'Rechazado';
        break;
      default:
        label = String(value).replace(/_/g, ' ');
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorStyle} ${className}`}>
      {label}
    </span>
  );
};
