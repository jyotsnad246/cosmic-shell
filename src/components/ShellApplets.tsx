import { useState } from 'react';
import { CheckCircle, Clock, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

interface AppletProps {
  onExit: () => void;
}

export const TodoApplet = ({ onExit }: AppletProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review pull requests', completed: false, createdAt: new Date() },
    { id: '2', text: 'Update documentation', completed: true, createdAt: new Date() }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date()
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-terminal-purple">📝 Todo List</h3>
        <Button variant="ghost" size="sm" onClick={onExit}>×</Button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1"
        />
        <Button onClick={addTodo} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 p-2 bg-background rounded border border-border">
            <button onClick={() => toggleTodo(todo.id)}>
              <CheckCircle className={`w-4 h-4 ${todo.completed ? 'text-terminal-green' : 'text-muted-foreground'}`} />
            </button>
            <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>
              <Trash2 className="w-4 h-4 text-terminal-red hover:opacity-70" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        {todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
      </div>
    </div>
  );
};

export const TimerApplet = ({ onExit }: AppletProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [customTime, setCustomTime] = useState('25');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(parseInt(customTime) * 60);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-terminal-blue">⏱️ Focus Timer</h3>
        <Button variant="ghost" size="sm" onClick={onExit}>×</Button>
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-terminal-green mb-4">
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex gap-2 mb-4 justify-center">
          <Button 
            onClick={toggleTimer} 
            variant={isRunning ? "destructive" : "default"}
            size="sm"
          >
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="sm">
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-center">
          <Input
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="w-16 text-center"
            min="1"
            max="120"
          />
          <span className="text-sm text-muted-foreground">minutes</span>
        </div>
      </div>
    </div>
  );
};

export const NoteApplet = ({ onExit }: AppletProps) => {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', content: 'Remember to update the README', createdAt: new Date() }
  ]);
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([{
        id: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date()
      }, ...notes]);
      setNewNote('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-terminal-yellow">📓 Quick Notes</h3>
        <Button variant="ghost" size="sm" onClick={onExit}>×</Button>
      </div>
      
      <div className="mb-4">
        <Input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a quick note..."
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          className="mb-2"
        />
        <Button onClick={addNote} size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.map(note => (
          <div key={note.id} className="p-3 bg-background rounded border border-border">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm flex-1">{note.content}</p>
              <button onClick={() => deleteNote(note.id)}>
                <Trash2 className="w-4 h-4 text-terminal-red hover:opacity-70" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {note.createdAt.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};