import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, HeartHandshake, PlusCircle, LayoutDashboard } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1.5 px-3 flex justify-around items-center shadow-lg">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-brand-600' : 'text-slate-500'}`
        }
      >
        <Home className="w-5 h-5" />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/necesidades-publicas"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-brand-600' : 'text-slate-500'}`
        }
      >
        <HeartHandshake className="w-5 h-5" />
        <span>Necesidades</span>
      </NavLink>

      <NavLink
        to="/solicitar-ayuda"
        className={() =>
          `flex flex-col items-center gap-0.5 text-[10px] font-medium bg-brand-600 text-white p-2.5 rounded-full -mt-5 shadow-md border-2 border-white`
        }
      >
        <PlusCircle className="w-6 h-6" />
      </NavLink>

      <NavLink
        to="/donar"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-brand-600' : 'text-slate-500'}`
        }
      >
        <HeartHandshake className="w-5 h-5" />
        <span>Ofrecer</span>
      </NavLink>

      <NavLink
        to="/panel"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-brand-600' : 'text-slate-500'}`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Panel</span>
      </NavLink>
    </div>
  );
};
