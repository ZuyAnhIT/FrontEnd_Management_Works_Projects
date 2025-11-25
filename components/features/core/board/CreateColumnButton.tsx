"use client";

import { Plus } from "lucide-react";

interface Props {
    onClick?: () => void;
}

export default function CreateColumnButton({ onClick }: Props) {
  return (
    <div className="w-[272px] h-12 shrink-0">
        <button 
            onClick={onClick}
            className="w-full h-full flex items-center justify-center gap-2 rounded-xl bg-slate-100/50 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-slate-500 font-medium transition-all"
        >
            <Plus className="w-5 h-5" />
            Add Column
        </button>
    </div>
  );
}