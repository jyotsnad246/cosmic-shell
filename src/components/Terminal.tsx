import { useState, useRef, useEffect } from 'react';
import { ChevronRight, GitBranch, Folder, Clock, Cpu, Zap } from 'lucide-react';

interface Command {
  id: string;
  input: string;
  output?: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

const Terminal = () => {
  const [input, setInput] = useState('');
  const [commands, setCommands] = useState<Command[]>([
    {
      id: '1',
      input: 'neofetch',
      output: `                    'c.          cosmic-shell v1.0.0
                 ,xNMM.          ─────────────────────
               .OMMMMo           OS: Cosmic Linux x86_64
               OMMM0,            Host: Terminal Prototype
     .;loddo:' loolloddol;.      Kernel: 6.5.0-cosmic
   cKMMMMMMMMMMNWMMMMMMMMMM0:    Uptime: 2 hours, 34 mins
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.    Packages: 1337 (cargo)
 XMMMMMMMMMMMMMMMMMMMMMMMX.      Shell: cosmic-shell
;MMMMMMMMMMMMMMMMMMMMMMMM:       Resolution: Enhanced UX
:MMMMMMMMMMMMMMMMMMMMMMMM:       Terminal: Prototype v1.0
.MMMMMMMMMMMMMMMMMMMMMMMMX.      CPU: Rust (8) @ 3.4GHz
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.    Memory: 42MB / 16384MB`,
      timestamp: new Date(Date.now() - 5000),
      type: 'success'
    }
  ]);
  const [history, setHistory] = useState<string[]>(['neofetch', 'ls -la', 'git status', 'cargo build --release']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  const handleCommand = (cmd: string) => {
    const newCommand: Command = {
      id: Date.now().toString(),
      input: cmd,
      timestamp: new Date(),
      type: 'success'
    };

    // Mock command responses
    switch (cmd.toLowerCase().trim()) {
      case 'ls':
      case 'ls -la':
        newCommand.output = `total 24
drwxr-xr-x  5 user user 4096 Jul 26 10:30 .
drwxr-xr-x  3 user user 4096 Jul 26 09:15 ..
drwxr-xr-x  8 user user 4096 Jul 26 10:29 .git
-rw-r--r--  1 user user 1234 Jul 26 10:30 Cargo.toml
-rw-r--r--  1 user user  567 Jul 26 10:25 README.md
drwxr-xr-x  2 user user 4096 Jul 26 10:29 src`;
        break;
      case 'git status':
        newCommand.output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/main.rs

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        src/terminal.rs

no changes added to commit (use "git add ." or "git commit -a")`;
        break;
      case 'pwd':
        newCommand.output = '/home/user/projects/cosmic-shell';
        break;
      case 'whoami':
        newCommand.output = 'cosmic-dev';
        break;
      case 'clear':
        setCommands([]);
        return;
      case 'help':
        newCommand.output = `Cosmic Shell - Enhanced Terminal Experience

Available commands:
  ls, ls -la    - List directory contents
  pwd           - Print working directory
  git status    - Show git repository status
  whoami        - Display current user
  clear         - Clear terminal
  help          - Show this help message
  explain <cmd> - AI explanation of command

Try typing any command to see syntax highlighting!`;
        break;
      default:
        if (cmd.startsWith('explain ')) {
          const command = cmd.slice(8);
          newCommand.output = `🤖 AI Explanation for "${command}":

This command would ${command.includes('git') ? 'interact with Git version control' : 
                      command.includes('ls') ? 'list directory contents with detailed information' :
                      command.includes('cd') ? 'change the current working directory' :
                      'execute a shell operation'}. 

In a real terminal, this would ${command.includes('-') ? 'use flags to modify behavior' : 'run with default options'}.`;
        } else {
          newCommand.output = `cosmic-shell: command not found: ${cmd}
Type 'help' for available commands.`;
          newCommand.type = 'error';
        }
    }

    setCommands(prev => [...prev, newCommand]);
    setHistory(prev => [cmd, ...prev.filter(h => h !== cmd)].slice(0, 50));
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input.trim());
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const formatCommand = (cmd: string) => {
    const parts = cmd.split(' ');
    return parts.map((part, index) => {
      let className = 'text-foreground';
      
      if (index === 0) {
        // Command name
        if (['ls', 'git', 'cd', 'pwd', 'cat', 'grep', 'find', 'cargo', 'npm', 'yarn'].includes(part)) {
          className = 'text-terminal-blue font-semibold';
        } else if (part.startsWith('./') || part.endsWith('.sh')) {
          className = 'text-terminal-green';
        } else {
          className = 'text-terminal-purple font-semibold';
        }
      } else if (part.startsWith('-')) {
        // Flags
        className = 'text-terminal-orange';
      } else if (part.includes('/') || part.includes('.')) {
        // Paths and files
        className = 'text-terminal-cyan';
      } else if (part.match(/^\d+$/)) {
        // Numbers
        className = 'text-terminal-yellow';
      }
      
      return (
        <span key={index} className={className}>
          {part}
          {index < parts.length - 1 && ' '}
        </span>
      );
    });
  };

  const Prompt = () => (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <Zap className="w-4 h-4 text-terminal-purple" />
        <span className="text-terminal-cyan font-semibold">cosmic-dev</span>
      </div>
      <span className="text-muted-foreground">@</span>
      <span className="text-terminal-green">cosmic-shell</span>
      <span className="text-muted-foreground">:</span>
      <div className="flex items-center gap-1">
        <Folder className="w-4 h-4 text-terminal-blue" />
        <span className="text-terminal-yellow">~/cosmic-shell</span>
      </div>
      <div className="flex items-center gap-1 text-terminal-orange">
        <GitBranch className="w-3 h-3" />
        <span className="text-xs">main</span>
        <span className="text-terminal-red text-xs">*</span>
      </div>
      <ChevronRight className="w-4 h-4 text-primary" />
    </div>
  );

  return (
    <div className="h-screen bg-background text-foreground font-mono">
      {/* Terminal Header */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-terminal-red"></div>
              <div className="w-3 h-3 rounded-full bg-terminal-yellow"></div>
              <div className="w-3 h-3 rounded-full bg-terminal-green"></div>
            </div>
            <span className="text-sm font-semibold">Cosmic Shell v1.0.0</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>2.1 GHz</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 h-[calc(100vh-60px)]"
      >
        <div className="space-y-2">
          {/* Welcome Message */}
          <div className="text-terminal-purple mb-4">
            <div className="text-lg font-bold mb-2">🚀 Welcome to Cosmic Shell</div>
            <div className="text-sm text-muted-foreground">
              Enhanced terminal with syntax highlighting, git integration, and AI-powered help.
              Type 'help' for available commands.
            </div>
          </div>

          {/* Command History */}
          {commands.map((command) => (
            <div key={command.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <Prompt />
                <span>{formatCommand(command.input)}</span>
              </div>
              {command.output && (
                <pre className={`text-sm pl-6 whitespace-pre-wrap ${
                  command.type === 'error' ? 'text-terminal-red' : 
                  command.type === 'info' ? 'text-terminal-blue' : 'text-foreground'
                }`}>
                  {command.output}
                </pre>
              )}
            </div>
          ))}

          {/* Current Input */}
          <div className="flex items-center gap-2">
            <Prompt />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-foreground"
              placeholder="Type a command..."
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;