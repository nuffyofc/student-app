import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, Calendar, BookOpen, CheckSquare, Code, Folder, 
  Clock, Brain, Lightbulb, ChevronLeft, Plus, Trash2,
  Play, Pause, RotateCcw, Trophy, Flame, Target, Star
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns'
import './index.css'

const STORAGE_KEY = 'student-productivity-app'

const defaultData = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActive: null,
  todayXP: 0,
  todayDate: null,
  tasks: [],
  subjects: ['General', 'Math', 'Science', 'Coding', 'Language'],
  activityLogs: [], 
  assignments: [],
  knowledgeLog: [],
  studyMaterial: [],
  exercises: [],
  timeLogs: [],
  brainGameStats: { highScore: 0, gamesPlayed: 0 }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultData, ...parsed }
    }
    return defaultData
  })
  const [showXPGain, setShowXPGain] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    const today = new Date().toDateString()
    if (data.lastActive !== today) {
      if (data.lastActive) {
        const lastDate = new Date(data.lastActive)
        const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          setData(prev => ({ ...prev, streak: prev.streak + 1 }))
        } else if (daysDiff > 1) {
          setData(prev => ({ ...prev, streak: 0 }))
        }
      }
      setData(prev => ({ ...prev, lastActive: today, todayXP: 0, todayDate: today }))
    }
  }, [data.lastActive])

  const xpTimeoutRef = useRef(null)

  const addXP = (amount, source) => {
    setData(prev => ({
      ...prev,
      xp: prev.xp + amount,
      level: Math.floor((prev.xp + amount) / 100) + 1,
      todayXP: prev.todayXP + amount
    }))
    
    if (xpTimeoutRef.current) clearTimeout(xpTimeoutRef.current)
    setShowXPGain({ amount, source, id: Date.now() })
    xpTimeoutRef.current = setTimeout(() => {
      setShowXPGain(null)
      xpTimeoutRef.current = null
    }, 2000)
  }

  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'assignments', icon: BookOpen, label: 'Tasks' },
    { id: 'tasks', icon: CheckSquare, label: 'House' },
    { id: 'exercises', icon: Code, label: 'Code' },
    { id: 'study', icon: Folder, label: 'Study' },
    { id: 'knowledge', icon: Lightbulb, label: 'Learn' },
    { id: 'timer', icon: Clock, label: 'Timer' },
    { id: 'games', icon: Brain, label: 'Games' },
  ]

  const xpToNext = data.level * 100
  const xpProgress = (data.xp % xpToNext) / xpToNext * 100

  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: format(addDays(new Date(), -6 + i), 'EEE'),
    xp: Math.floor(Math.random() * 50) + 10
  }))

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      <AnimatePresence>
        {showXPGain && (
          <motion.div
            key={showXPGain.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#58CC02] text-white px-8 py-4 rounded-2xl font-bold text-3xl shadow-[0_10px_0_#46a302] border-4 border-white"
          >
            +{showXPGain.amount} XP!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center gap-3">
          <Brain className="w-8 h-8 text-[#58CC02]" />
          <span className="text-2xl font-black text-gray-800">StudyOS</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                activeTab === tab.id 
                  ? 'bg-blue-50 text-[#1CB0F6]' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-gradient-to-b from-blue-50 to-gray-50">
        {activeTab !== 'dashboard' && (
          <div className="md:hidden p-4">
             <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              onClick={() => setActiveTab('dashboard')}
              className="p-3 bg-white rounded-full shadow-md z-40 relative"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
          </div>
        )}

        <div className="pt-6 px-4 md:px-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              data={data} 
              xpProgress={xpProgress}
              xpToNext={xpToNext}
              chartData={chartData}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'calendar' && <CalendarView data={data} setData={setData} addXP={addXP} />}
          {activeTab === 'assignments' && <AssignmentsView data={data} setData={setData} addXP={addXP} />}
          {activeTab === 'tasks' && <TasksView data={data} setData={setData} addXP={addXP} />}
          {activeTab === 'exercises' && <ExercisesView data={data} setData={setData} addXP={addXP} />}
          {activeTab === 'study' && <StudyView data={data} setData={setData} />}
          {activeTab === 'knowledge' && <KnowledgeView data={data} setData={setData} addXP={addXP} />}
          {activeTab === 'timer' && <TimerView addXP={addXP} />}
          {activeTab === 'games' && <GamesView data={data} setData={setData} addXP={addXP} />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="flex justify-around">
          {tabs.map(tab => (
            <button
               key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'text-[#1CB0F6] bg-blue-50' 
                  : 'text-gray-400'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function PageGuide({ title, desc, guide }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-white/60 backdrop-blur-md border border-white rounded-3xl overflow-hidden shadow-sm"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1CB0F6]/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-[#1CB0F6]" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">How to use {title}</h3>
            <p className="text-xs text-gray-500 font-medium">{isOpen ? 'Click to collapse' : 'Click to read guide'}</p>
          </div>
        </div>
        <ChevronLeft className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6"
          >
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <p className="text-gray-600 leading-relaxed font-medium">
                {desc}
              </p>
              <p className="text-gray-600 leading-relaxed font-medium bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <span className="text-[#1CB0F6] font-black mr-2">PRO TIP:</span>
                {guide}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActivityHeatmap({ activityLogs }) {
  const days = Array.from({length: 28}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toDateString();
  });

  return (
    <div className="duo-card flex flex-col items-center">
      <h3 className="font-bold text-gray-700 w-full mb-4 flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-500" />
        Activity Heatmap
      </h3>
      <div className="grid grid-cols-7 gap-2 w-full justify-items-center">
        {days.map(d => {
          // This will be dynamic when activityLogs are wired up
          const logXP = d === new Date().toDateString() ? 50 : 0; 
          const intensity = logXP > 0 ? (logXP > 50 ? 'bg-green-500' : 'bg-green-400') : 'bg-gray-100';
          return <div key={d} className={`w-6 h-6 md:w-8 md:h-8 rounded-lg ${intensity} hover:ring-2 ring-[#58CC02] cursor-pointer transition-all`} title={d} />
        })}
      </div>
    </div>
  )
}

function Dashboard({ data, xpProgress, xpToNext, chartData, onNavigate }) {
  const statCards = [
    { icon: Trophy, label: 'Level', value: data.level, color: '#8E57FF', bg: '#F3E8FF' },
    { icon: Flame, label: 'Streak', value: data.streak, color: '#FF9600', bg: '#FFF3E0' },
    { icon: Target, label: 'Today XP', value: data.todayXP, color: '#1CB0F6', bg: '#E0F2FE' },
    { icon: Star, label: 'Total XP', value: data.xp, color: '#FFD700', bg: '#FEF9E7' },
  ]

  const quickActions = [
    { label: 'Study', color: 'bg-[#8E57FF]', tab: 'study' },
    { label: 'Tasks', color: 'bg-[#58CC02]', tab: 'tasks' },
    { label: 'Code', color: 'bg-[#1CB0F6]', tab: 'exercises' },
    { label: 'Games', color: 'bg-[#FF4B4B]', tab: 'games' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <PageGuide 
        title="Dashboard" 
        desc="The Dashboard is your mission control center, providing a birds-eye view of your academic performance and daily productivity. It tracks your level, XP progress, and current streak to keep you motivated and accountable."
        guide="Use the stat cards to monitor your growth and check the priority tasks section for immediate action items. You can also view your activity heatmap and focus trends to identify your peak performance hours throughout the week."
      />

      <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">Welcome back!</h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Your war room is ready. Let's get to work.</p>
        </div>
        <div className="hidden md:block bg-blue-50 p-4 rounded-2xl">
          <Brain className="w-12 h-12 text-[#1CB0F6]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Progress Bar */}
          <div className="duo-card border-2 border-gray-100">
            <div className="flex justify-between mb-3">
              <span className="font-black text-gray-700 text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                Level {data.level}
              </span>
              <span className="text-gray-500 font-bold">{Math.floor(data.xp % xpToNext)} <span className="text-gray-400">/ {xpToNext} XP</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden shadow-inner">
              <motion.div 
                className="bg-gradient-to-r from-green-400 to-[#58CC02] h-full rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-white opacity-20 transform -skew-x-12 translate-x-4"></div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="duo-card flex flex-col items-center text-center hover:-translate-y-1 transition-transform border border-transparent hover:border-gray-200"
              >
                <div className="p-4 rounded-2xl mb-3 shadow-inner" style={{ backgroundColor: stat.bg }}>
                  <stat.icon style={{ color: stat.color }} className="w-8 h-8" />
                </div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800 mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="duo-card flex flex-col justify-between">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" /> Focus Activity
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 'bold' }} />
                  <YAxis hide />
                  <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="xp" stroke="#1CB0F6" strokeWidth={4} dot={{ fill: '#1CB0F6', r: 5, strokeWidth: 3, stroke: 'white' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <ActivityHeatmap activityLogs={data.activityLogs || []} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                onClick={() => onNavigate(action.tab)}
                className={`${action.color} text-white font-black py-8 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 text-lg flex flex-col items-center justify-center gap-2`}
              >
                {action.label}
              </motion.button>
            ))}
          </div>

          <div className="duo-card bg-gradient-to-br from-gray-800 to-gray-900 border-none relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain className="w-24 h-24 text-white" />
             </div>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-white relative z-10">
              <CheckSquare className="w-5 h-5 text-[#58CC02]" /> Priority Tasks
            </h3>
            <div className="space-y-3 relative z-10">
              {data.tasks.filter(t => !t.locked).slice(0, 3).map(task => (
                <div key={task.id} className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-between border border-white/10">
                  <span className="truncate pr-2">{task.title}</span>
                  <div className="w-2 h-2 rounded-full bg-[#58CC02]"></div>
                </div>
              ))}
              {data.tasks.filter(t => !t.locked).length === 0 && (
                <div className="bg-white/5 border border-white/10 px-4 py-6 rounded-xl text-center">
                  <p className="text-white/60 font-medium text-sm">No active tasks.</p>
                  <p className="text-white/40 text-xs mt-1">Time to chill! 😎</p>
                </div>
              )}
            </div>
            <button onClick={() => onNavigate('tasks')} className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors relative z-10 border border-white/20">
              Go to War Room
            </button>
          </div>
        </div>
        
      </div>
      <div className="pt-8 border-t border-gray-100 mt-6 bg-white p-6 rounded-3xl shadow-sm">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Danger Zone</h4>
        <button 
          onClick={() => {
            if(window.confirm('🚨 ALL progress, XP, and tasks will be deleted forever. Area you sure?')) {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }
          }}
          className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all border-2 border-dashed border-red-100 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" /> Wipe Local Storage
        </button>
      </div>
    </motion.div>
  )
}

function CalendarView({ data, setData, addXP }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState(data.calendarEvents || [])
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', date: '' })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPadding = monthStart.getDay()

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      const updated = [...events, { ...newEvent, id: Date.now() }]
      setEvents(updated)
      setData(prev => ({ ...prev, calendarEvents: updated }))
      setNewEvent({ title: '', date: '' })
      setShowAdd(false)
      addXP(5, 'calendar event')
    }
  }

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Calendar" 
        desc="The Calendar view is your strategic planning tool for managing deadlines, exams, and important study milestones. It offers a clear visual representation of your upcoming schedule so you can avoid last-minute cramming and stay ahead of your workload."
        guide="Simply click the 'Add Event' button to log a new date with a title and specific date. Once saved, events will appear as green dots on the calendar grid; you can click on individual events to see details or remove them when they are no longer relevant."
      />

      <div className="duo-card">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">&#9664;</button>
          <h2 className="font-bold text-xl">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">&#9654;</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(startPadding).fill(null).map((_, i) => (
            <div key={`pad-${i}`} className="h-10" />
          ))}
          {days.map(day => {
            const dayEvents = events.filter(e => isSameDay(new Date(e.date), day))
            const isToday = isSameDay(day, new Date())
            return (
              <div key={day.toString()} className={`h-10 flex flex-col items-center justify-center rounded-lg ${isToday ? 'bg-[#58CC02] text-white' : 'hover:bg-gray-100'}`}>
                <span className={`text-sm ${isToday ? 'text-white' : 'text-gray-700'}`}>{format(day, 'd')}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-[#58CC02]'}`} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAdd(!showAdd)}
        className="duo-button w-full mt-4 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Add Event
      </motion.button>

      {showAdd && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="duo-card mt-4"
        >
          <input
            type="text"
            placeholder="Event title"
            className="duo-input mb-3"
            value={newEvent.title}
            onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="date"
            className="duo-input mb-3"
            value={newEvent.date}
            onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
          />
          <button onClick={handleAddEvent} className="duo-button w-full">Save Event</button>
        </motion.div>
      )}

      <div className="mt-4 space-y-2">
        {events.map(event => (
          <div key={event.id} className="duo-card flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800">{event.title}</p>
              <p className="text-gray-500 text-sm">{format(new Date(event.date), 'MMM d, yyyy')}</p>
            </div>
            <button onClick={() => {
              const updated = events.filter(e => e.id !== event.id)
              setEvents(updated)
              setData(prev => ({ ...prev, calendarEvents: updated }))
            }} className="text-red-500 p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function AssignmentsView({ data, setData, addXP }) {
  const [newAssign, setNewAssign] = useState({ title: '', due: '', subject: '' })
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = () => {
    if (newAssign.title && newAssign.due) {
      const updated = [...data.assignments, { ...newAssign, id: Date.now(), completed: false }]
      setData(prev => ({ ...prev, assignments: updated }))
      setNewAssign({ title: '', due: '', subject: '' })
      setShowAdd(false)
      addXP(3, 'assignment added')
    }
  }

  const toggleComplete = (id) => {
    const updated = data.assignments.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    )
    setData(prev => ({ ...prev, assignments: updated }))
    const assignment = data.assignments.find(a => a.id === id)
    if (assignment && !assignment.completed) {
      addXP(10, 'assignment done')
    }
  }

  const sortedAssignments = [...data.assignments].sort((a, b) => new Date(a.due) - new Date(b.due))

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Assignments" 
        desc="This page is dedicated to tracking formal academic assignments, projects, and homework that have specific due dates. It helps you prioritize your schoolwork by organizing everything in a single, sorted list based on urgency."
        guide="Enter the assignment title, subject, and due date to create a new tracking card. As you finish your work, click the checkmark to mark it complete and earn bonus XP, which will automatically contribute to your overall level progression."
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Assignments</h2>
      
      <button onClick={() => setShowAdd(!showAdd)} className="duo-button w-full mb-4 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Add Assignment
      </button>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="duo-card mb-4">
          <input
            type="text"
            placeholder="Assignment title"
            className="duo-input mb-3"
            value={newAssign.title}
            onChange={e => setNewAssign(prev => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Subject (e.g., Math, English)"
            className="duo-input mb-3"
            value={newAssign.subject}
            onChange={e => setNewAssign(prev => ({ ...prev, subject: e.target.value }))}
          />
          <div className="relative">
            <label className="text-xs font-bold text-gray-400 absolute -top-2 left-3 bg-white px-1">Due Date</label>
            <input
              type="date"
              className="duo-input mb-3 pt-4"
              value={newAssign.due}
              onChange={e => setNewAssign(prev => ({ ...prev, due: e.target.value }))}
            />
          </div>
          <button onClick={handleAdd} className="duo-button w-full">Save</button>
        </motion.div>
      )}

      <div className="space-y-3">
        {sortedAssignments.map(assign => {
          const isOverdue = new Date(assign.due) < new Date() && !assign.completed
          return (
            <div key={assign.id} className={`duo-card flex items-center gap-3 ${assign.completed ? 'opacity-60' : ''}`}>
              <button
                onClick={() => toggleComplete(assign.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  assign.completed ? 'bg-[#58CC02] border-[#58CC02]' : 'border-gray-300'
                }`}
              >
                {assign.completed && <CheckSquare className="w-5 h-5 text-white" />}
              </button>
              <div className="flex-1">
                <p className={`font-bold ${assign.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {assign.title}
                </p>
                <p className="text-sm text-gray-500">{assign.subject} - Due: {assign.due}</p>
              </div>
              {isOverdue && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Overdue</span>}
            </div>
          )
        })}
        {data.assignments.length === 0 && <p className="text-gray-400 text-center">No assignments yet!</p>}
      </div>
    </motion.div>
  )
}

function TasksView({ data, setData, addXP }) {
  const [newTask, setNewTask] = useState('')
  const [taskSubject, setTaskSubject] = useState(data.subjects[0] || 'General')
  const [showAdd, setShowAdd] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState(null)

  useEffect(() => {
    let interval
    if (activeTaskId) {
      interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t =>
            t.id === activeTaskId ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } : t
          )
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTaskId, setData])

  const handleAdd = () => {
    if (newTask.trim()) {
      const updated = [...data.tasks, { id: Date.now(), title: newTask, completed: false, timeSpent: 0, locked: false, subject: taskSubject }]
      setData(prev => ({ ...prev, tasks: updated }))
      setNewTask('')
      setShowAdd(false)
      addXP(2, 'task added')
    }
  }

  const toggleComplete = (id) => {
    if (activeTaskId === id) setActiveTaskId(null)
    const task = data.tasks.find(t => t.id === id)
    if (!task) return
    
    if (task.locked) return // Cannot undo locked tasks

    const updated = data.tasks.map(t => 
      t.id === id ? { ...t, completed: true, locked: true, completedAt: new Date().toISOString() } : t
    )
    setData(prev => ({ ...prev, tasks: updated }))
    addXP(5, 'task done')
  }

  const toggleTimer = (id) => {
    if (activeTaskId === id) {
      setActiveTaskId(null)
    } else {
      setActiveTaskId(id)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return '00:00'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const activeTasks = data.tasks.filter(t => !t.locked)
  const doneTasks = data.tasks.filter(t => t.locked)

  // Group active tasks by subject
  const groupedTasks = activeTasks.reduce((acc, task) => {
    const subj = task.subject || 'General';
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(task);
    return acc;
  }, {})

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-2xl mx-auto pt-8 pb-24"
    >
      <PageGuide 
        title="War Room Tasks" 
        desc="The War Room is where deep work happens, allowing you to break down your large projects into actionable, timed focus sessions. It combines task management with a real-time timer to ensure you stay concentrated on one specific goal at a time."
        guide="Add a task and select its category to create a focus card. Click the 'Play' button to start the integrated timer while you work; once finished, hit 'Done' to log your time spent and permanently archive the task while receiving XP rewards for your focus."
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Focus Tasks</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-[#58CC02] text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Task
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="duo-card mb-8 space-y-4 border-2 border-[#1CB0F6]">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Task Title</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              className="duo-input"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Subject / Project</label>
            <select 
              className="duo-input" 
              value={taskSubject} 
              onChange={e => setTaskSubject(e.target.value)}
            >
              {data.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} className="w-full bg-[#1CB0F6] text-white font-bold py-3 rounded-xl shadow-sm hover:bg-blue-500 transition-colors">
            Save Task
          </button>
        </motion.div>
      )}

      <div className="space-y-8">
        <div>
          {Object.keys(groupedTasks).length > 0 ? (
            Object.entries(groupedTasks).map(([subject, tasks]) => (
              <div key={subject} className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-xl">
                  <Folder className="w-6 h-6 text-[#8E57FF]" /> {subject}
                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{tasks.length} active</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map(task => (
                    <div key={task.id} className="duo-card flex flex-col justify-between gap-4 border-l-4 border-[#1CB0F6] hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-800 text-lg leading-tight">{task.title}</span>
                        <button onClick={() => {
                          const updated = data.tasks.filter(t => t.id !== task.id)
                          setData(prev => ({ ...prev, tasks: updated }))
                          if (activeTaskId === task.id) setActiveTaskId(null)
                        }} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between border-t pt-3 border-gray-100">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleTimer(task.id)}
                            className={`p-3 rounded-xl transition-all shadow-sm ${
                              activeTaskId === task.id 
                                ? 'bg-[#FF4B4B] text-white shadow-[#FF4B4B]/30' 
                                : 'bg-[#1CB0F6] text-white shadow-[#1CB0F6]/30 hover:scale-105'
                            }`}
                          >
                            {activeTaskId === task.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <span className={`font-mono font-bold text-lg ${activeTaskId === task.id ? 'text-[#FF4B4B]' : 'text-gray-500'}`}>
                            {formatTime(task.timeSpent)}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#58CC02] text-white font-bold rounded-xl shadow-sm hover:bg-green-500 transition-colors hover:scale-105 active:scale-95"
                        >
                          <CheckSquare className="w-5 h-5" /> Done
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Brain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold text-lg">No active tasks.</p>
              <p className="text-gray-400 font-medium">Add a task and select a subject to begin your focus session.</p>
            </div>
          )}
        </div>

        {doneTasks.length > 0 && (
          <div>
            <h3 className="font-black flex items-center gap-2 mb-4 text-gray-500 px-2 uppercase tracking-wide text-sm">
              <CheckSquare className="w-4 h-4" /> Completed Log
            </h3>
            <div className="space-y-3 bg-gray-100 p-4 rounded-3xl border border-gray-200">
              {doneTasks.map(task => (
                <div key={task.id} className="bg-white px-4 py-3 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-2 border-l-4 border-gray-300 opacity-70">
                  <div className="flex flex-col">
                    <span className="line-through text-gray-500 font-bold">{task.title}</span>
                    <div className="flex items-center gap-2 mt-1 mt-1">
                      <Folder className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">{task.subject || 'General'}</span>
                      {task.completedAt && (
                        <span className="text-xs text-gray-400 border-l pl-2 border-gray-200">
                          {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span className="text-sm font-mono bg-gray-50 px-3 py-1 rounded-lg text-gray-500 font-bold border border-gray-100">
                      ⏱ {formatTime(task.timeSpent)}
                    </span>
                    <button onClick={() => {
                      const updated = data.tasks.filter(t => t.id !== task.id)
                      setData(prev => ({ ...prev, tasks: updated }))
                    }} className="text-gray-300 hover:text-red-500 bg-gray-50 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ExercisesView({ data, setData, addXP }) {
  const [newEx, setNewEx] = useState({ title: '', progress: 0 })
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = () => {
    if (newEx.title) {
      const updated = [...data.exercises, { ...newEx, id: Date.now() }]
      setData(prev => ({ ...prev, exercises: updated }))
      setNewEx({ title: '', progress: 0 })
      setShowAdd(false)
      addXP(3, 'project added')
    }
  }

  const updateProgress = (id, progress) => {
    const updated = data.exercises.map(e => e.id === id ? { ...e, progress } : e)
    setData(prev => ({ ...prev, exercises: updated }))
    if (progress === 100) {
      addXP(20, 'project completed')
    }
  }

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Coding Projects" 
        desc="Coding Projects is a specialized tracker for long-term development work or iterative learning exercises where progress is measured in percentages. It’s perfect for tracking the completion of coding courses, building apps, or mastering new programming concepts."
        guide="Create a project by giving it a name, and then use the interactive slider to update your progress as you hit different milestones. Reaching 100% completion will award you a significant XP boost, reflecting the effort required for multi-step projects."
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Coding Projects</h2>
      
      <button onClick={() => setShowAdd(!showAdd)} className="duo-button w-full mb-4 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Add Project
      </button>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="duo-card mb-4">
          <input
            type="text"
            placeholder="Project name"
            className="duo-input mb-3"
            value={newEx.title}
            onChange={e => setNewEx(prev => ({ ...prev, title: e.target.value }))}
          />
          <button onClick={handleAdd} className="duo-button w-full">Save</button>
        </motion.div>
      )}

      <div className="space-y-3">
        {data.exercises.map(ex => (
          <div key={ex.id} className="duo-card">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-800">{ex.title}</span>
              <span className="font-bold" style={{ color: '#58CC02' }}>{ex.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={ex.progress}
              onChange={e => updateProgress(ex.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: '#58CC02' }}
            />
            <button 
              onClick={() => {
                const updated = data.exercises.filter(e => e.id !== ex.id)
                setData(prev => ({ ...prev, exercises: updated }))
              }}
              className="text-gray-400 text-sm mt-2 hover:text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
        {data.exercises.length === 0 && <p className="text-gray-400 text-center">No projects yet!</p>}
      </div>
    </motion.div>
  )
}

function StudyView({ data, setData }) {
  const [newItem, setNewItem] = useState({ title: '', type: 'link', content: '' })
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = () => {
    if (newItem.title && newItem.content) {
      const updated = [...data.studyMaterial, { ...newItem, id: Date.now() }]
      setData(prev => ({ ...prev, studyMaterial: updated }))
      setNewItem({ title: '', type: 'link', content: '' })
      setShowAdd(false)
    }
  }

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Study Resources" 
        desc="The Study Material section serves as your personal knowledge repository for saving essential links, notes, and file references. It organizes your external learning resources so you don't have to waste time searching through bookmarks or desktop folders."
        guide="Use the 'Add Resource' form to select a type—Link, Note, or File—and enter the corresponding title and content. Links are clickable for quick access to websites, while notes provide a space for short summaries or reminders related to your subjects."
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Study Material</h2>
      
      <button onClick={() => setShowAdd(!showAdd)} className="duo-button w-full mb-4 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Add Resource
      </button>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="duo-card mb-4">
          <input
            type="text"
            placeholder="Title"
            className="duo-input mb-3"
            value={newItem.title}
            onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
          />
          <select
            className="duo-input mb-3"
            value={newItem.type}
            onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="link">Link</option>
            <option value="note">Note</option>
            <option value="file">File</option>
          </select>
          <textarea
            placeholder={newItem.type === 'link' ? 'URL' : 'Content'}
            className="duo-input mb-3 h-24"
            value={newItem.content}
            onChange={e => setNewItem(prev => ({ ...prev, content: e.target.value }))}
          />
          <button onClick={handleAdd} className="duo-button w-full">Save</button>
        </motion.div>
      )}

      <div className="space-y-3">
        {data.studyMaterial.map(item => (
          <div key={item.id} className="duo-card">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.type === 'link' ? 'bg-blue-100 text-blue-600' :
                item.type === 'note' ? 'bg-yellow-100 text-yellow-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {item.type}
              </span>
              <span className="font-bold text-gray-800">{item.title}</span>
            </div>
            {item.type === 'link' ? (
              <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-[#1CB0F6] hover:underline text-sm">
                {item.content}
              </a>
            ) : (
              <p className="text-gray-600 text-sm">{item.content}</p>
            )}
          </div>
        ))}
        {data.studyMaterial.length === 0 && <p className="text-gray-400 text-center">No study material yet!</p>}
      </div>
    </motion.div>
  )
}

function KnowledgeView({ data, setData, addXP }) {
  const [newEntry, setNewEntry] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = () => {
    if (newEntry.trim()) {
      const updated = [{ id: Date.now(), content: newEntry, date: new Date().toISOString() }, ...data.knowledgeLog]
      setData(prev => ({ ...prev, knowledgeLog: updated }))
      setNewEntry('')
      setShowAdd(false)
      addXP(8, 'knowledge entry')
    }
  }

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Knowledge Log" 
        desc="The Knowledge Log is a reflective space for recording the core concepts and new facts you learn each day. Documenting your daily takeaways reinforces your memory and provides a chronological history of your intellectual growth over time."
        guide="Click 'Add Entry' and write a short summary of what you discovered during your study sessions. Each entry is timestamped and saved in a scrolling log, helping you visualize the breadth of topics you've mastered since starting with StudyOS."
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Knowledge Log</h2>
      <p className="text-gray-500 mb-4">What did you learn today?</p>
      
      <button onClick={() => setShowAdd(!showAdd)} className="duo-button w-full mb-4 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Add Entry
      </button>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="duo-card mb-4">
          <textarea
            placeholder="Today I learned..."
            className="duo-input h-32"
            value={newEntry}
            onChange={e => setNewEntry(e.target.value)}
          />
          <button onClick={handleAdd} className="duo-button w-full mt-3">Save</button>
        </motion.div>
      )}

      <div className="space-y-3">
        {data.knowledgeLog.map(entry => (
          <div key={entry.id} className="duo-card">
            <p className="text-gray-800">{entry.content}</p>
            <p className="text-gray-400 text-sm mt-2">{format(new Date(entry.date), 'MMM d, yyyy h:mm a')}</p>
          </div>
        ))}
        {data.knowledgeLog.length === 0 && <p className="text-gray-400 text-center">No entries yet!</p>}
      </div>
    </motion.div>
  )
}

function TimerView({ addXP }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)

  useEffect(() => {
    let interval
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      setSessions(s => s + 1)
      addXP(15, 'pomodoro complete')
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, addXP])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setTimeLeft(25 * 60)
    setIsRunning(false)
  }

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Pomodoro Timer" 
        desc="The Pomodoro Timer implements the famous time-management technique to balance intense focus with regular breaks. This method prevents burnout and maintains high levels of productivity by breaking your study day into manageable intervals."
        guide="Set the timer and press 'Play' to start a 25-minute deep focus session. When the timer hits zero, you’ll earn XP and a session count will be added to your daily total; use the 'Reset' button to start over or take a short break before beginning your next interval."
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Pomodoro Timer</h2>
      
      <div className="duo-card text-center py-12 mb-4">
        <div className="text-7xl font-bold text-gray-800 mb-8">{formatTime(timeLeft)}</div>
        
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className={`${isRunning ? 'bg-[#FF9600]' : 'bg-[#58CC02]'} text-white font-bold py-4 px-8 rounded-2xl shadow-lg`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-2xl shadow-lg"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <div className="duo-card text-center">
        <p className="text-gray-500">Sessions completed today</p>
        <p className="text-4xl font-bold" style={{ color: '#58CC02' }}>{sessions}</p>
      </div>
    </motion.div>
  )
}

function GamesView({ data, setData, addXP }) {
  const [game, setGame] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [question, setQuestion] = useState({ num1: 0, num2: 0, answer: 0 })
  const [options, setOptions] = useState([])

  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 12) + 1
    const num2 = Math.floor(Math.random() * 12) + 1
    const answer = num1 * num2
    
    const wrong = new Set()
    while (wrong.size < 3) {
      const offset = Math.floor(Math.random() * 20) - 10
      const w = answer + offset
      if (w !== answer && w > 0) {
        wrong.add(w)
      }
    }
    
    const opts = [answer, ...Array.from(wrong)].sort(() => Math.random() - 0.5)
    return { num1, num2, answer, opts }
  }

  const startMathGame = () => {
    const { num1, num2, answer, opts } = generateMathQuestion()
    setQuestion({ num1, num2, answer })
    setOptions(opts)
    setScore(0)
    setGameOver(false)
    setGame('math')
  }

  const handleAnswer = (ans) => {
    if (ans === question.answer) {
      setScore(s => s + 1)
      addXP(1, 'math game')
      setTimeout(() => {
        const { num1, num2, answer, opts } = generateMathQuestion()
        setQuestion({ num1, num2, answer })
        setOptions(opts)
      }, 300)
    } else {
      setGameOver(true)
      const newStats = { ...data.brainGameStats, highScore: Math.max(data.brainGameStats.highScore, score), gamesPlayed: data.brainGameStats.gamesPlayed + 1 }
      setData(prev => ({ ...prev, brainGameStats: newStats }))
    }
  }

  if (game === 'math' && !gameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto pt-12"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500">Score</p>
          <p className="text-6xl font-bold" style={{ color: '#58CC02' }}>{score}</p>
        </div>
        
        <div className="duo-card text-center py-12 mb-4">
          <p className="text-5xl font-bold text-gray-800 mb-8">
            {question.num1} x {question.num2}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(opt)}
                className="bg-[#1CB0F6] text-white font-bold text-2xl py-6 rounded-2xl shadow-lg"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>

        <button onClick={() => setGame(null)} className="w-full py-3 text-gray-500">Back to games</button>
      </motion.div>
    )
  }

  if (gameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto pt-12 text-center"
      >
        <div className="duo-card py-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
          <p className="text-6xl font-bold mb-4" style={{ color: '#58CC02' }}>{score}</p>
          <p className="text-gray-500 mb-8">Final Score</p>
          <button onClick={() => setGame(null)} className="duo-button">Play Again</button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-md mx-auto pt-12 pb-12"
    >
      <PageGuide 
        title="Brain Games" 
        desc="Brain Games offer a fun, gamified way to sharpen your cognitive skills and take a productive break from heavy studying. These mini-games are designed to improve your mental math speed, memory, and reaction times while still contributing to your XP goal."
        guide="Select 'Math Quick Fire' to start a multiplication challenge where you must choose the correct answer from multiple options. Every correct answer earns you XP, but be careful—the game ends if you make a mistake, forcing you to try and beat your high score."
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Brain Games</h2>
      
      <div className="duo-card mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">High Score</span>
          <span className="font-bold" style={{ color: '#FFD700' }}>{data.brainGameStats.highScore}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-500">Games Played</span>
          <span className="font-bold" style={{ color: '#1CB0F6' }}>{data.brainGameStats.gamesPlayed}</span>
        </div>
      </div>

      <div className="space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startMathGame}
          className="duo-card w-full text-left flex items-center gap-4 hover:border-[#58CC02] transition-colors"
          style={{ border: '2px solid transparent' }}
        >
          <div className="bg-orange-100 p-4 rounded-xl">
            <span className="text-2xl">123</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Math Quick Fire</h3>
            <p className="text-gray-500 text-sm">Solve multiplication problems fast!</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="duo-card w-full text-left flex items-center gap-4 opacity-50"
        >
          <div className="bg-purple-100 p-4 rounded-xl">
            <span className="text-2xl">?</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Memory Match</h3>
            <p className="text-gray-500 text-sm">Coming soon!</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="duo-card w-full text-left flex items-center gap-4 opacity-50"
        >
          <div className="bg-blue-100 p-4 rounded-xl">
            <span className="text-2xl">ABC</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Typing Speed</h3>
            <p className="text-gray-500 text-sm">Coming soon!</p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default App