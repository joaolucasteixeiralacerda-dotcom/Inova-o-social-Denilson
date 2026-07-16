import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, UtensilsCrossed, Coffee, Sun, Cookie, CalendarDays, Leaf, Flame, Settings, CalendarRange } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MEAL_CONFIG = {
  cafe_da_manha: {
    label: "Café da Manhã",
    icon: Coffee,
    color: "from-amber-400 to-orange-400",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    accent: "bg-amber-400",
    description: "Comece o dia com energia",
  },
  almoco: {
    label: "Almoço",
    icon: Sun,
    color: "from-orange-400 to-red-400",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    accent: "bg-orange-400",
    description: "A refeição principal do dia",
  },
  lanche_da_tarde: {
    label: "Lanche da Tarde",
    icon: Cookie,
    color: "from-rose-400 to-pink-400",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    accent: "bg-rose-400",
    description: "Um reforço para a tarde",
  },
};

function MenuItemCard({ item, index }) {
  const config = MEAL_CONFIG[item.meal_type] || MEAL_CONFIG.almoco;
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {item.image_url && !imgError ? (
        <div className="h-40 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`h-40 ${config.bg} flex items-center justify-center`}>
          <UtensilsCrossed className={`w-12 h-12 ${config.text} opacity-50`} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-heading text-lg font-bold text-stone-800 leading-tight">
            {item.name}
          </h3>
          {item.is_vegetarian && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">
              <Leaf className="w-3 h-3" /> Veg
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-stone-500 mb-3 leading-relaxed">{item.description}</p>
        )}
        {item.ingredients && (
          <p className="text-xs text-stone-400 mb-3 leading-relaxed">
            <span className="font-semibold text-stone-500">Ingredientes: </span>
            {item.ingredients}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-stone-500">
          {item.calories && (
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> {item.calories} kcal
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MealSection({ mealType, items }) {
  const config = MEAL_CONFIG[mealType];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-stone-800">{config.label}</h2>
          <p className="text-xs text-stone-400">{config.description}</p>
        </div>
        <span className={`ml-auto text-xs font-medium px-3 py-1 rounded-full ${config.bg} ${config.text}`}>
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, idx) => (
          <MenuItemCard key={item.id} item={item} index={idx} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const items = await base44.entities.MenuItem.filter(
          { menu_date: selectedDate },
          "-created_date"
        );
        setMenuItems(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [selectedDate]);

  const groupedItems = useMemo(() => {
    const grouped = { cafe_da_manha: [], almoco: [], lanche_da_tarde: [] };
    menuItems.forEach((item) => {
      if (grouped[item.meal_type]) grouped[item.meal_type].push(item);
    });
    return grouped;
  }, [menuItems]);

  const hasItems = menuItems.length > 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-stone-800 leading-tight">Merenda Escolar</h1>
              <p className="text-[11px] text-stone-400 leading-tight">Escola Integral</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                title="Gestão do cardápio"
              >
                <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Gestão</span>
              </Link>
            )}
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-sm font-medium text-stone-700">{user?.full_name || "Aluno"}</span>
              <span className="text-[11px] text-stone-400">{user?.email}</span>
            </div>
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

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stone-800 mb-2">
              Cardápio do Dia
            </h2>
            <p className="text-stone-400 text-sm">
              Confira as refeições preparadas com carinho para nossa comunidade escolar
            </p>
          </motion.div>
        </div>

        {/* Weekly view link */}
        <div className="flex justify-center mb-6">
          <Link
            to="/semana"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-orange-300 hover:bg-orange-50 text-stone-700 hover:text-orange-600 font-medium text-sm shadow-sm transition-all"
          >
            <CalendarRange className="w-4 h-4" />
            Ver cardápio da semana (Seg–Sex)
          </Link>
        </div>

        {/* Date Picker */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-4 py-2.5 shadow-sm">
            <CalendarDays className="w-4 h-4 text-orange-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-medium text-stone-700 bg-transparent outline-none cursor-pointer"
            />
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Voltar para hoje
            </button>
          )}
          <span className="text-sm text-stone-400 capitalize">{formatDate(selectedDate)}</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-stone-400">Carregando cardápio...</p>
          </div>
        ) : !hasItems ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-stone-600 mb-1">
              Nenhum cardápio cadastrado
            </h3>
            <p className="text-sm text-stone-400">
              Não há refeições programadas para {formatDate(selectedDate)}.
            </p>
          </div>
        ) : (
          /* Menu Sections */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <MealSection mealType="cafe_da_manha" items={groupedItems.cafe_da_manha} />
            <MealSection mealType="almoco" items={groupedItems.almoco} />
            <MealSection mealType="lanche_da_tarde" items={groupedItems.lanche_da_tarde} />
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-stone-400">
            Merenda Escolar · Escola Integral · Alimentação saudável para um aprendizado melhor
          </p>
        </div>
      </footer>
    </div>
  );
}
