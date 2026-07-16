import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import {
  LogOut, UtensilsCrossed, ArrowLeft, ChevronLeft, ChevronRight, CalendarDays,
  Coffee, Sun, Cookie, Leaf, Flame, AlertTriangle, RefreshCw, XCircle, Info, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const MEAL_CONFIG = {
  cafe_da_manha: { label: "Café da Manhã", icon: Coffee, color: "from-amber-400 to-orange-400", bg: "bg-amber-50", text: "text-amber-700" },
  almoco: { label: "Almoço", icon: Sun, color: "from-orange-400 to-red-400", bg: "bg-orange-50", text: "text-orange-700" },
  lanche_da_tarde: { label: "Lanche da Tarde", icon: Cookie, color: "from-rose-400 to-pink-400", bg: "bg-rose-50", text: "text-rose-700" },
};

const AVISO_CONFIG = {
  cancelamento: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconColor: "text-red-500" },
  alteracao: { icon: RefreshCw, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconColor: "text-amber-500" },
  aviso: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconColor: "text-blue-500" },
};

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

function getWeekDays(weekOffset) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function DayColumn({ date, dayName, items, avisos, isToday }) {
  const grouped = { cafe_da_manha: [], almoco: [], lanche_da_tarde: [] };
  items.forEach((item) => {
    if (grouped[item.meal_type]) grouped[item.meal_type].push(item);
  });
  const dayAvisos = avisos.filter((a) => a.affected_date === date && a.is_active !== false);

  return (
    <div className={`bg-white rounded-2xl border ${isToday ? "border-orange-300 shadow-md" : "border-stone-100 shadow-sm"} overflow-hidden flex flex-col`}>
      {/* Day header */}
      <div className={`px-4 py-3 ${isToday ? "bg-gradient-to-r from-orange-500 to-amber-500" : "bg-stone-50"} text-center`}>
        <p className={`font-heading font-bold text-sm ${isToday ? "text-white" : "text-stone-700"}`}>{dayName}</p>
        <p className={`text-xs ${isToday ? "text-white/80" : "text-stone-400"}`}>
          {new Date(date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
        </p>
        {isToday && <span className="text-[10px] text-white/90 font-medium">Hoje</span>}
      </div>

      <div className="p-3 flex-1 flex flex-col gap-3">
        {/* Day-level notices (geral) */}
        {dayAvisos.filter((a) => a.meal_type === "geral").map((aviso) => {
          const config = AVISO_CONFIG[aviso.type] || AVISO_CONFIG.aviso;
          const Icon = config.icon;
          return (
            <div key={aviso.id} className={`flex items-start gap-2 rounded-lg ${config.bg} ${config.border} border p-2.5`}>
              <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-xs font-semibold ${config.text}`}>{aviso.title}</p>
                <p className="text-[11px] text-stone-500 leading-snug">{aviso.message}</p>
              </div>
            </div>
          );
        })}

        {/* Meals */}
        {Object.entries(MEAL_CONFIG).map(([mealKey, config]) => {
          const mealItems = grouped[mealKey];
          const mealAvisos = dayAvisos.filter((a) => a.meal_type === mealKey);
          const Icon = config.icon;
          return (
            <div key={mealKey}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className={`w-3.5 h-3.5 ${config.text}`} />
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">{config.label}</span>
              </div>
              {/* Meal notices */}
              {mealAvisos.map((aviso) => {
                const aConfig = AVISO_CONFIG[aviso.type] || AVISO_CONFIG.aviso;
                const AIcon = aConfig.icon;
                return (
                  <div key={aviso.id} className={`flex items-start gap-1.5 rounded-lg ${aConfig.bg} ${aConfig.border} border p-2 mb-2`}>
                    <AIcon className={`w-3.5 h-3.5 ${aConfig.iconColor} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-[11px] font-semibold ${aConfig.text}`}>{aviso.title}</p>
                      <p className="text-[10px] text-stone-500 leading-tight">{aviso.message}</p>
                    </div>
                  </div>
                );
              })}
              {/* Items */}
              {mealItems.length > 0 ? (
                <div className="space-y-2">
                  {mealItems.map((item) => (
                    <div key={item.id} className="rounded-lg bg-stone-50 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-stone-700 leading-tight">{item.name}</p>
                        {item.is_vegetarian && <Leaf className="w-3 h-3 text-green-600 flex-shrink-0" />}
                      </div>
                      {item.description && (
                        <p className="text-[10px] text-stone-400 mt-0.5 leading-tight line-clamp-2">{item.description}</p>
                      )}
                      {item.calories && (
                        <p className="flex items-center gap-1 text-[10px] text-stone-400 mt-1">
                          <Flame className="w-2.5 h-2.5 text-orange-400" /> {item.calories} kcal
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : mealAvisos.length === 0 ? (
                <p className="text-[10px] text-stone-300 italic">Sem itens</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CardapioSemanal() {
  const { user, logout } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const todayStr = new Date().toISOString().split("T")[0];

  const weekRangeLabel = useMemo(() => {
    const start = new Date(weekDays[0] + "T00:00:00");
    const end = new Date(weekDays[4] + "T00:00:00");
    const fmt = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
  }, [weekDays]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [items, avisosData] = await Promise.all([
          base44.entities.MenuItem.filter(
            { menu_date: { $gte: weekDays[0], $lte: weekDays[4] } },
            "-created_date",
            300
          ),
          base44.entities.Aviso.filter(
            { affected_date: { $gte: weekDays[0], $lte: weekDays[4] } },
            "-created_date",
            200
          ),
        ]);
        setMenuItems(items);
        setAvisos(avisosData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [weekDays]);

  const itemsByDate = useMemo(() => {
    const map = {};
    weekDays.forEach((d) => (map[d] = []));
    menuItems.forEach((item) => {
      if (map[item.menu_date]) map[item.menu_date].push(item);
    });
    return map;
  }, [menuItems, weekDays]);

  const totalAvisos = useMemo(
    () => avisos.filter((a) => a.is_active !== false).length,
    [avisos]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-stone-800 leading-tight">Cardápio da Semana</h1>
              <p className="text-[11px] text-stone-400 leading-tight">Segunda a Sexta</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Hoje</span>
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <UtensilsCrossed className="w-4 h-4" /> <span className="hidden sm:inline">Gestão</span>
              </Link>
            )}
            <button
              onClick={() => logout("/login")}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-800 mb-1">
            Cardápio Semanal
          </h2>
          <p className="text-sm text-stone-400">Acompanhe as refeições e avisos da semana</p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-stone-200 shadow-sm">
            <CalendarDays className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-stone-700 capitalize">{weekRangeLabel}</span>
          </div>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {weekOffset !== 0 && (
          <div className="text-center mb-6">
            <button
              onClick={() => setWeekOffset(0)}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Voltar para esta semana
            </button>
          </div>
        )}

        {/* Notices banner */}
        {totalAvisos > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 max-w-2xl mx-auto"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {totalAvisos} {totalAvisos === 1 ? "aviso ativo" : "avisos ativos"} nesta semana. Confira abaixo.
            </p>
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-3" />
            <p className="text-sm text-stone-400">Carregando cardápio da semana...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {weekDays.map((date, idx) => (
              <DayColumn
                key={date}
                date={date}
                dayName={WEEKDAYS[idx]}
                items={itemsByDate[date] || []}
                avisos={avisos}
                isToday={date === todayStr}
              />
            ))}
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs text-stone-400">
          <span className="flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5 text-red-500" /> Cancelamento</span>
          <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Alteração</span>
          <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-blue-500" /> Aviso</span>
        </div>
      </main>
    </div>
  );
}
