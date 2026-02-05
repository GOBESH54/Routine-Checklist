import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Settings, CheckCircle2, Circle, 
  Flame, Clock, BarChart3, X, Plus, Edit2, Trash2, Save, Target, Award, TrendingUp 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LineChart, Line, Tooltip } from 'recharts';
import { supabase } from './supabaseClient';

// Generate unique device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Default routine data structure
const DEFAULT_ROUTINES = {
  college: [
    { id: 'c1', time: '6:00 AM', task: 'Wake up & Morning Routine', duration: 30 },
    { id: 'c2', time: '6:30 AM', task: 'Quick Review (Yesterday\'s Notes)', duration: 30 },
    { id: 'c3', time: '7:00 AM', task: 'Breakfast & Prep', duration: 30 },
    { id: 'c4', time: '8:00 AM', task: 'College Classes', duration: 360 },
    { id: 'c5', time: '4:00 PM', task: 'Lunch & Rest', duration: 60 },
    { id: 'c6', time: '5:00 PM', task: '1 Hour Skill Building', duration: 60 },
    { id: 'c7', time: '6:00 PM', task: 'Assignment/Homework', duration: 90 },
    { id: 'c8', time: '8:00 PM', task: 'Dinner & Family Time', duration: 60 },
    { id: 'c9', time: '9:00 PM', task: 'Light Study/Reading', duration: 60 },
    { id: 'c10', time: '10:00 PM', task: 'Wind Down & Sleep Prep', duration: 30 }
  ],
  holiday: [
    { id: 'h1', time: '7:00 AM', task: 'Wake up & Morning Routine', duration: 45 },
    { id: 'h2', time: '8:00 AM', task: 'Breakfast & Planning', duration: 45 },
    { id: 'h3', time: '9:00 AM', task: 'Deep Focus: Coding Session', duration: 180 },
    { id: 'h4', time: '12:00 PM', task: 'Lunch & Break', duration: 90 },
    { id: 'h5', time: '2:00 PM', task: 'Detailed Revision/Study', duration: 120 },
    { id: 'h6', time: '4:00 PM', task: 'Project Work', duration: 120 },
    { id: 'h7', time: '6:00 PM', task: 'Exercise/Outdoor Activity', duration: 60 },
    { id: 'h8', time: '7:00 PM', task: 'Leisure/Hobby Time', duration: 90 },
    { id: 'h9', time: '8:30 PM', task: 'Dinner & Relaxation', duration: 90 },
    { id: 'h10', time: '10:00 PM', task: 'Reading/Learning', duration: 60 },
    { id: 'h11', time: '11:00 PM', task: 'Wind Down & Sleep', duration: 30 }
  ]
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEditRoutine, setShowEditRoutine] = useState(false);
  const [routines, setRoutines] = useState(DEFAULT_ROUTINES);
  const [editingTask, setEditingTask] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const userId = getDeviceId();

  // Load data from Supabase
  useEffect(() => {
    loadFromCloud();
  }, []);

  const loadFromCloud = async () => {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setCompletedTasks(data.completed_tasks || {});
        setIsHolidayMode(data.is_holiday_mode || false);
        setRoutines(data.routines || DEFAULT_ROUTINES);
      }
    } catch (err) {
      console.log('Loading from local storage as fallback');
      const saved = localStorage.getItem('routineData');
      if (saved) {
        const data = JSON.parse(saved);
        setCompletedTasks(data.completedTasks || {});
        setIsHolidayMode(data.isHolidayMode || false);
        setRoutines(data.routines || DEFAULT_ROUTINES);
      }
    }
  };

  // Save data to Supabase
  const saveToCloud = async (tasks, holiday, routineData) => {
    setSyncing(true);
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          completed_tasks: tasks,
          is_holiday_mode: holiday,
          routines: routineData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Auto-save to cloud
  useEffect(() => {
    if (Object.keys(completedTasks).length > 0 || routines !== DEFAULT_ROUTINES) {
      saveToCloud(completedTasks, isHolidayMode, routines);
      // Also save to localStorage as backup
      localStorage.setItem('routineData', JSON.stringify({
        completedTasks,
        isHolidayMode,
        routines
      }));
    }
  }, [completedTasks, isHolidayMode, routines]);



  const dateKey = currentDate.toISOString().split('T')[0];
  const currentRoutine = isHolidayMode ? routines.holiday : routines.college;
  const todayData = completedTasks[dateKey] || { completed: [], wasHoliday: isHolidayMode };
  const todayCompleted = Array.isArray(todayData) ? todayData : (todayData.completed || []);

  const toggleTask = (taskId) => {
    const newCompleted = todayCompleted.includes(taskId)
      ? todayCompleted.filter(id => id !== taskId)
      : [...todayCompleted, taskId];
    
    setCompletedTasks({
      ...completedTasks,
      [dateKey]: { completed: newCompleted, wasHoliday: isHolidayMode }
    });
  };



  const completionRate = currentRoutine.length > 0 
    ? Math.round((todayCompleted.length / currentRoutine.length) * 100) 
    : 0;

  // Calculate analytics


  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayData = completedTasks[key] || { completed: [], wasHoliday: false };
      const wasHoliday = dayData.wasHoliday || false;
      const routine = wasHoliday ? routines.holiday : routines.college;
      const completed = Array.isArray(dayData) ? dayData : (dayData.completed || []);
      const rate = routine.length > 0 ? (completed.length / routine.length) : 0;
      
      if (rate >= 0.7) streak++;
      else break;
    }
    return streak;
  };

  const calculateFocusHours = () => {
    const focusTasks = currentRoutine.filter(task => todayCompleted.includes(task.id));
    return Math.round(focusTasks.reduce((sum, task) => sum + task.duration, 0) / 60 * 10) / 10;
  };

  const weeklyCompletion = () => {
    const analytics = getWeekAnalytics();
    return Math.round(analytics.weekData.reduce((sum, day) => sum + day.rate, 0) / 7);
  };

  const addTask = (mode) => {
    const newTask = {
      id: `${mode[0]}${Date.now()}`,
      time: '12:00 PM',
      task: 'New Task',
      duration: 60
    };
    setRoutines({
      ...routines,
      [mode]: [...routines[mode], newTask]
    });
  };

  const deleteTask = (mode, taskId) => {
    setRoutines({
      ...routines,
      [mode]: routines[mode].filter(t => t.id !== taskId)
    });
  };

  const updateTask = (mode, taskId, updates) => {
    setRoutines({
      ...routines,
      [mode]: routines[mode].map(t => t.id === taskId ? { ...t, ...updates } : t)
    });
  };

  const getWeekAnalytics = () => {
    const weekData = [];
    let totalCollegeFocus = 0;
    let totalHolidayFocus = 0;
    let collegeCount = 0;
    let holidayCount = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const dayData = completedTasks[key] || { completed: [], wasHoliday: false };
      const wasHoliday = dayData.wasHoliday || false;
      const routine = wasHoliday ? routines.holiday : routines.college;
      const completed = Array.isArray(dayData) ? dayData : (dayData.completed || []);
      const completedRoutine = routine.filter(t => completed.includes(t.id));
      const focusHours = completedRoutine.reduce((sum, t) => sum + t.duration, 0) / 60;
      const rate = routine.length > 0 ? Math.round((completed.length / routine.length) * 100) : 0;

      if (wasHoliday) {
        totalHolidayFocus += focusHours;
        holidayCount++;
      } else {
        totalCollegeFocus += focusHours;
        collegeCount++;
      }

      weekData.push({
        day: DAYS[dayOfWeek],
        short: DAYS[dayOfWeek].slice(0, 3),
        rate,
        focusHours: Math.round(focusHours * 10) / 10,
        isHoliday: wasHoliday,
        isToday: i === 0
      });
    }

    return {
      weekData,
      avgCollegeFocus: collegeCount > 0 ? Math.round((totalCollegeFocus / collegeCount) * 10) / 10 : 0,
      avgHolidayFocus: holidayCount > 0 ? Math.round((totalHolidayFocus / holidayCount) * 10) / 10 : 0,
      totalFocus: Math.round((totalCollegeFocus + totalHolidayFocus) * 10) / 10
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/80 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isHolidayMode ? (
              <Sun className="w-7 h-7 text-amber-400" />
            ) : (
              <Moon className="w-7 h-7 text-blue-400" />
            )}
            <div>
              <h1 className="text-xl font-bold">Smart Routine</h1>
              <p className="text-xs text-gray-400">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {isHolidayMode ? '🌴 Holiday Mode' : '📚 College Mode'}
                {syncing && <span className="text-green-400">• Syncing...</span>}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditRoutine(true)}
              className="p-2 rounded-lg transition-all hover:bg-gray-700 text-gray-300 hover:text-white"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="p-2 rounded-lg transition-all hover:bg-gray-700 text-gray-300 hover:text-white"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg transition-all hover:bg-gray-700 text-gray-300 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Stats */}
        <div className="mb-6 space-y-4">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl text-center bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <div className="flex justify-center mb-1">
                <Target className="w-5 h-5 text-blue-200" />
              </div>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-xs text-blue-200">Today</div>
            </div>
            <div className="p-4 rounded-xl text-center bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg">
              <div className="flex justify-center mb-1">
                <Flame className="w-5 h-5 text-orange-200" />
              </div>
              <div className="text-2xl font-bold">{calculateStreak()}</div>
              <div className="text-xs text-orange-200">Streak</div>
            </div>
            <div className="p-4 rounded-xl text-center bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg">
              <div className="flex justify-center mb-1">
                <Clock className="w-5 h-5 text-purple-200" />
              </div>
              <div className="text-2xl font-bold">{calculateFocusHours()}h</div>
              <div className="text-xs text-purple-200">Focus</div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {currentRoutine.map((task, index) => {
            const isCompleted = todayCompleted.includes(task.id);
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? 'bg-gray-800/40 opacity-60 border border-gray-700' 
                    : 'bg-gray-800/80 shadow-lg hover:shadow-xl hover:bg-gray-800 border border-gray-700'
                } ${isCompleted ? 'task-checked' : ''}`}
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className={`w-6 h-6 ${
                        isHolidayMode ? 'text-amber-400' : 'text-blue-400'
                      }`} />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${
                        isCompleted ? 'line-through text-gray-500' : 'text-gray-100'
                      }`}>
                        {task.task}
                      </span>
                      <span className="text-xs text-gray-500">{task.duration}m</span>
                    </div>
                    <div className="text-sm text-gray-400">{task.time}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1">Today's Mode</h3>
                    <p className="text-sm text-gray-400">
                      {isHolidayMode ? 'Holiday Routine (Full Day)' : 'College Routine (Limited Time)'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsHolidayMode(!isHolidayMode)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      isHolidayMode ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        isHolidayMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-400 p-3 bg-gray-800/30 rounded-lg">
                <p className="mb-2">💡 <strong>Tip:</strong> Switch between modes based on your day:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>College Mode:</strong> For busy days with classes</li>
                  <li><strong>Holiday Mode:</strong> For free days with more time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Routine Modal */}
      {showEditRoutine && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto text-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Routines</h2>
              <button onClick={() => { setShowEditRoutine(false); setEditingTask(null); }} className="p-2 hover:bg-gray-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* College Routine */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">College Mode Tasks</h3>
                <button
                  onClick={() => addTask('college')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {routines.college.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    {editingTask === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) => updateTask('college', task.id, { task: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          placeholder="Task name"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={task.time}
                            onChange={(e) => updateTask('college', task.id, { time: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            placeholder="Time"
                          />
                          <input
                            type="number"
                            value={task.duration}
                            onChange={(e) => updateTask('college', task.id, { duration: parseInt(e.target.value) })}
                            className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            placeholder="Min"
                          />
                        </div>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          <Save className="w-3 h-3" /> Done
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{task.task}</div>
                          <div className="text-sm text-gray-400">{task.time} • {task.duration}m</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTask(task.id)}
                            className="p-1.5 hover:bg-gray-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask('college', task.id)}
                            className="p-1.5 hover:bg-red-900/50 text-red-400 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Holiday Routine */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">Holiday Mode Tasks</h3>
                <button
                  onClick={() => addTask('holiday')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {routines.holiday.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    {editingTask === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) => updateTask('holiday', task.id, { task: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          placeholder="Task name"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={task.time}
                            onChange={(e) => updateTask('holiday', task.id, { time: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            placeholder="Time"
                          />
                          <input
                            type="number"
                            value={task.duration}
                            onChange={(e) => updateTask('holiday', task.id, { duration: parseInt(e.target.value) })}
                            className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            placeholder="Min"
                          />
                        </div>
                        <button
                          onClick={() => setEditingTask(null)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          <Save className="w-3 h-3" /> Done
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{task.task}</div>
                          <div className="text-sm text-gray-400">{task.time} • {task.duration}m</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTask(task.id)}
                            className="p-1.5 hover:bg-gray-700 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTask('holiday', task.id)}
                            className="p-1.5 hover:bg-red-900/50 text-red-400 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (() => {
        const analytics = getWeekAnalytics();
        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Weekly Analytics</h2>
                  <p className="text-sm text-gray-400">Your productivity insights</p>
                </div>
                <button onClick={() => setShowAnalytics(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Productivity Comparison */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-amber-900/40 rounded-xl border border-gray-700">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Productivity Comparison
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">📚 College Days Avg</div>
                    <div className="text-3xl font-bold text-blue-400">{analytics.avgCollegeFocus}h</div>
                    <div className="text-xs text-gray-500 mt-1">Focus time per day</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">🌴 Holiday Days Avg</div>
                    <div className="text-3xl font-bold text-amber-400">{analytics.avgHolidayFocus}h</div>
                    <div className="text-xs text-gray-500 mt-1">Focus time per day</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">Total Week Focus</div>
                  <div className="text-2xl font-bold text-green-400">{analytics.totalFocus}h</div>
                </div>
              </div>

              {/* Weekly Completion Chart */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Completion Rate (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.weekData}>
                    <XAxis dataKey="short" stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                      {analytics.weekData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isToday ? '#10b981' : entry.isHoliday ? '#f59e0b' : '#3b82f6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Focus Hours Chart */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Focus Hours Trend</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={analytics.weekData}>
                    <XAxis dataKey="short" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="focusHours" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Day-by-Day Breakdown */}
              <div className="mb-4">
                <h3 className="font-medium mb-3">Day-by-Day Breakdown</h3>
                <div className="space-y-2">
                  {analytics.weekData.map((day, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${
                      day.isToday ? 'bg-green-900/20 border-green-700' : 'bg-gray-800/50 border-gray-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{day.day}</span>
                          <span className="text-xs px-2 py-1 rounded-full ${
                            day.isHoliday ? 'bg-amber-900/50 text-amber-300' : 'bg-blue-900/50 text-blue-300'
                          }">
                            {day.isHoliday ? '🌴 Holiday' : '📚 College'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Completion</div>
                            <div className="font-bold">{day.rate}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Focus</div>
                            <div className="font-bold text-purple-400">{day.focusHours}h</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <div className="text-sm text-blue-200 mb-1">Weekly Avg</div>
                  <div className="text-3xl font-bold">{weeklyCompletion()}%</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg">
                  <div className="text-sm text-orange-200 mb-1 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> Streak
                  </div>
                  <div className="text-3xl font-bold">{calculateStreak()} days</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default App;
