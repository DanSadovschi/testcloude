import { type FormEvent, useEffect, useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import type { Task, TaskPriority } from '../types';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

function getLocalDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TasksPage() {
  const { tasks, loading, error, fetchTasks } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const todayStr = getLocalDateString();

  const todayTasks = tasks.filter((t) => t.due_date === selectedDate);
  const overdueTasks = selectedDate === todayStr
    ? tasks.filter((t) => t.due_date && t.due_date < todayStr && t.status === 'todo')
    : [];
  const noDueDateTasks = tasks.filter((t) => !t.due_date && t.status === 'todo');

  const todoDone = todayTasks.filter((t) => t.status === 'done').length;
  const todoTotal = todayTasks.length;
  const progressPct = todoTotal > 0 ? Math.round((todoDone / todoTotal) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold dark:text-white">Tasks</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`text-sm px-3 py-1 rounded-md ${selectedDate === todayStr ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Today
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {todoTotal > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{todoDone} of {todoTotal} done</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <TaskForm defaultDate={selectedDate} />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
      ) : (
        <>
          {overdueTasks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">Overdue</h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                {overdueTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </div>
          )}

          {todayTasks.length === 0 && overdueTasks.length === 0 && noDueDateTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No tasks for this day. Add one above.</p>
          ) : (
            <>
              {todayTasks.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {selectedDate === todayStr ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h2>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {todayTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </ul>
                </div>
              )}

              {noDueDateTasks.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">No due date</h2>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {noDueDateTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function TaskForm({ defaultDate }: { defaultDate: string }) {
  const createTask = useTaskStore((s) => s.createTask);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const ok = await createTask(title.trim(), priority, defaultDate);
    if (ok) {
      setTitle('');
      setPriority('medium');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 mb-6 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New task
        </label>
        <input
          id="task-title"
          type="text"
          placeholder="What needs to be done?"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}

function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useTaskStore();
  const [confirming, setConfirming] = useState(false);
  const isDone = task.status === 'done';

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await deleteTask(task.id);
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800">
      <button
        onClick={() => toggleTask(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isDone
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
        }`}
      >
        {isDone && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
          {task.title}
        </p>
        {task.due_date && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{task.due_date}</p>
        )}
      </div>

      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
        {task.priority}
      </span>

      <div className="flex items-center gap-2 flex-shrink-0">
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleDelete}
          className={`text-sm ${confirming ? 'text-red-600 font-medium' : 'text-gray-400 hover:text-red-500'}`}
        >
          {confirming ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
