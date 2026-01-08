import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, ImageIcon, Mail, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import defaultBg from "@assets/generated_images/serene_pastel_landscape_background.png";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

interface Memo {
  date: string;
  content: string;
}

const MONTHS_KR = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월"
];

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarTodo() {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(defaultBg);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const year = 2026;
  const daysInMonth = getDaysInMonth(year, currentMonth);
  const firstDay = getFirstDayOfMonth(year, currentMonth);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDate(year, currentMonth, day);
    setSelectedDate(dateStr);
  };

  const addTodo = () => {
    if (!newTodoText.trim() || !selectedDate) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      date: selectedDate,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getTodosForDate = (date: string) => {
    return todos.filter((todo) => todo.date === date);
  };

  const getMemoForDate = (date: string) => {
    return memos.find((memo) => memo.date === date)?.content || "";
  };

  const updateMemo = (content: string) => {
    if (!selectedDate) return;
    const existingIndex = memos.findIndex((m) => m.date === selectedDate);
    if (existingIndex >= 0) {
      const updated = [...memos];
      updated[existingIndex] = { date: selectedDate, content };
      setMemos(updated);
    } else {
      setMemos([...memos, { date: selectedDate, content }]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const shareViaEmail = () => {
    if (!selectedDate) return;
    const dateTodos = getTodosForDate(selectedDate);
    const memo = getMemoForDate(selectedDate);
    const month = parseInt(selectedDate.split("-")[1]);
    const day = parseInt(selectedDate.split("-")[2]);
    
    const subject = encodeURIComponent(`2026년 ${month}월 ${day}일 일정`);
    const todoList = dateTodos.map((t) => `${t.completed ? "✓" : "○"} ${t.text}`).join("\n");
    const body = encodeURIComponent(
      `📅 2026년 ${month}월 ${day}일\n\n` +
      `📝 할 일 목록:\n${todoList || "없음"}\n\n` +
      `📒 메모:\n${memo || "없음"}`
    );
    
    window.open(`mailto:chlaudwn93@yonsei.ac.kr?subject=${subject}&body=${body}`, "_blank");
  };

  const selectedDateTodos = selectedDate ? getTodosForDate(selectedDate) : [];
  const currentMemo = selectedDate ? getMemoForDate(selectedDate) : "";
  const hasMemo = (date: string) => memos.some((m) => m.date === date && m.content.trim());

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white drop-shadow-lg" data-testid="text-title">
              2026 Calendar
            </h1>
            <label
              className="glass flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer hover:bg-white/90 transition-all"
              data-testid="button-upload-background"
            >
              <ImageIcon className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">배경 변경</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                data-testid="input-background-image"
              />
            </label>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 glass rounded-3xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={goToPrevMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-800" data-testid="text-current-month">
                  {year}년 {MONTHS_KR[currentMonth]}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  data-testid="button-next-month"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                {DAYS_KR.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center py-2 text-sm font-semibold ${
                      index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-600"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  const dateStr = formatDate(year, currentMonth, day);
                  const dayTodos = getTodosForDate(dateStr);
                  const dayHasMemo = hasMemo(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const dayOfWeek = (firstDay + day - 1) % 7;
                  const isToday = new Date().toISOString().split("T")[0] === dateStr;

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDayClick(day)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                        isSelected
                          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                          : isToday
                          ? "bg-purple-100 text-purple-700"
                          : "hover:bg-gray-100"
                      } ${dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : ""}`}
                      data-testid={`button-day-${day}`}
                    >
                      <span className={`text-sm md:text-base font-medium ${isSelected ? "text-white" : ""}`}>
                        {day}
                      </span>
                      <div className="absolute bottom-1 flex gap-0.5">
                        {dayTodos.length > 0 && (
                          <>
                            {dayTodos.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? "bg-white/80" : "bg-purple-500"
                                }`}
                              />
                            ))}
                          </>
                        )}
                        {dayHasMemo && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? "bg-yellow-300" : "bg-yellow-500"
                            }`}
                          />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-semibold text-gray-800 flex items-center gap-2" data-testid="text-todo-header">
                    <Check className="w-5 h-5 text-purple-500" />
                    {selectedDate ? (
                      <>
                        {parseInt(selectedDate.split("-")[1])}월 {parseInt(selectedDate.split("-")[2])}일 할 일
                      </>
                    ) : (
                      "할 일"
                    )}
                  </h3>
                </div>

                {selectedDate ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTodo()}
                        placeholder="새 할 일 추가..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 text-sm"
                        data-testid="input-new-todo"
                      />
                      <button
                        onClick={addTodo}
                        className="p-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/30"
                        data-testid="button-add-todo"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      <AnimatePresence mode="popLayout">
                        {selectedDateTodos.length === 0 ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-gray-400 py-4 text-sm"
                            data-testid="text-no-todos"
                          >
                            할 일이 없습니다
                          </motion.p>
                        ) : (
                          selectedDateTodos.map((todo) => (
                            <motion.div
                              key={todo.id}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -100 }}
                              className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                                todo.completed
                                  ? "bg-gray-100/50"
                                  : "bg-white/50 shadow-sm"
                              }`}
                              data-testid={`todo-item-${todo.id}`}
                            >
                              <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                  todo.completed
                                    ? "bg-purple-500 border-purple-500"
                                    : "border-gray-300 hover:border-purple-500"
                                }`}
                                data-testid={`button-toggle-todo-${todo.id}`}
                              >
                                {todo.completed && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <span
                                className={`flex-1 text-sm text-gray-700 ${
                                  todo.completed ? "line-through text-gray-400" : ""
                                }`}
                                data-testid={`text-todo-${todo.id}`}
                              >
                                {todo.text}
                              </span>
                              <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                data-testid={`button-delete-todo-${todo.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm" data-testid="text-select-date-hint">
                      날짜를 선택하세요
                    </p>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-semibold text-gray-800 flex items-center gap-2" data-testid="text-memo-header">
                    <StickyNote className="w-5 h-5 text-yellow-500" />
                    메모
                  </h3>
                  {selectedDate && (
                    <button
                      onClick={shareViaEmail}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                      data-testid="button-share-email"
                      title="이메일로 공유"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="hidden sm:inline">메일 발송</span>
                    </button>
                  )}
                </div>

                {selectedDate ? (
                  <textarea
                    value={currentMemo}
                    onChange={(e) => updateMemo(e.target.value)}
                    placeholder="이 날의 메모를 작성하세요..."
                    className="w-full h-32 px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400 resize-none text-sm"
                    data-testid="textarea-memo"
                  />
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">
                      날짜를 선택하세요
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
