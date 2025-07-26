import { useState, useRef, useEffect } from 'react';
import { ChevronRight, GitBranch, Folder, Clock, Cpu, Zap, Search, Download, Upload, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CommandPalette from './CommandPalette';
import CommandDiff from './CommandDiff';
import DirectoryGoals from './DirectoryGoals';
import { TodoApplet, TimerApplet, NoteApplet } from './ShellApplets';

interface Command {
  id: string;
  input: string;
  output?: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
  directory?: string;
  tags?: string[];
  explanation?: string;
}

type ActiveApplet = 'todo' | 'timer' | 'note' | null;

interface SessionData {
  commands: Command[];
  workingDirectory: string;
  timestamp: Date;
  sessionName: string;
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
      type: 'success',
      directory: '/home/user/projects/cosmic-shell'
    }
  ]);
  const [history, setHistory] = useState<string[]>(['neofetch', 'ls -la', 'git status', 'cargo build --release']);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeApplet, setActiveApplet] = useState<ActiveApplet>(null);
  const [currentDirectory, setCurrentDirectory] = useState('/home/user/projects/cosmic-shell');
  const [isExplanationMode, setIsExplanationMode] = useState(false);
  const [lastSimilarCommand, setLastSimilarCommand] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const findSimilarCommand = (cmd: string) => {
    const similarCmd = history.find(h => 
      h.startsWith(cmd.split(' ')[0]) && h !== cmd
    );
    return similarCmd || '';
  };

  const getCommandExplanation = (cmd: string): string => {
    const explanations: Record<string, string> = {
      'ls': 'Lists files and directories in the current location',
      'git status': 'Shows the current state of your Git repository - which files are modified, staged, or untracked',
      'cargo build': 'Compiles your Rust project and all its dependencies',
      'cargo test': 'Runs all tests in your Rust project',
      'pwd': 'Prints the current working directory path',
      'cd': 'Changes the current directory to the specified path',
      'clear': 'Clears the terminal screen of all previous output'
    };
    
    const baseCmd = cmd.split(' ')[0];
    return explanations[baseCmd] || `Executes the '${baseCmd}' command with the given parameters`;
  };

  const handleCommand = (cmd: string) => {
    // Check for explanation mode
    if (cmd.startsWith('?? ')) {
      const actualCmd = cmd.slice(3);
      const explanation = getCommandExplanation(actualCmd);
      const newCommand: Command = {
        id: Date.now().toString(),
        input: cmd,
        output: `🤖 Command Explanation:\n\n${explanation}\n\nWould you like to run this command? Type: ${actualCmd}`,
        timestamp: new Date(),
        type: 'info',
        directory: currentDirectory,
        explanation
      };
      setCommands(prev => [...prev, newCommand]);
      setHistory(prev => [cmd, ...prev.filter(h => h !== cmd)].slice(0, 50));
      return;
    }

    // Check for applet commands
    if (cmd.startsWith('/')) {
      const appletName = cmd.slice(1);
      if (['todo', 'timer', 'note'].includes(appletName)) {
        setActiveApplet(appletName as ActiveApplet);
        return;
      }
    }

    // Find similar command for diff
    const similar = findSimilarCommand(cmd);
    if (similar) {
      setLastSimilarCommand(similar);
    }

    const newCommand: Command = {
      id: Date.now().toString(),
      input: cmd,
      timestamp: new Date(),
      type: 'success',
      directory: currentDirectory
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
        newCommand.output = `🚀 Cosmic Shell - Enhanced Terminal Experience

Core Commands:
  ls, ls -la    - List directory contents
  pwd           - Print working directory  
  git status    - Show git repository status
  whoami        - Display current user
  clear         - Clear terminal

🔮 Unique Features:
  ?? <command>  - Get AI explanation before running
  /todo         - Open todo list applet
  /timer        - Open focus timer applet  
  /note         - Open quick notes applet
  Cmd+P         - Open command palette

🛠️ Session Management:
  export-session <name> - Export current session
  import-session <name> - Import saved session

Try typing any command to see syntax highlighting!`;
        break;
      case 'export-session':
      case 'export-session default':
        const sessionData: SessionData = {
          commands: commands.slice(-10), // Last 10 commands
          workingDirectory: currentDirectory,
          timestamp: new Date(),
          sessionName: cmd.includes(' ') ? cmd.split(' ')[1] : 'default'
        };
        newCommand.output = `📦 Session exported successfully!
Session: ${sessionData.sessionName}
Commands: ${sessionData.commands.length}
Directory: ${sessionData.workingDirectory}
Timestamp: ${sessionData.timestamp.toLocaleString()}

Use 'import-session ${sessionData.sessionName}' to restore this session.`;
        break;
      case 'import-session':
      case 'import-session default':
        newCommand.output = `📥 Session imported successfully!
Restored 8 commands and directory context.
Welcome back to your previous session!`;
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

💡 Try these features:
  • Type '?? ${cmd}' for AI explanation
  • Press Cmd+P for command palette
  • Type 'help' for all available commands`;
          newCommand.type = 'error';
        }
    }

    setCommands(prev => [...prev, newCommand]);
    setHistory(prev => [cmd, ...prev.filter(h => h !== cmd)].slice(0, 50));
    setHistoryIndex(-1);
    setLastSimilarCommand('');
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
            <div className="text-lg font-bold mb-2">🚀 Welcome to Cosmic Shell v2.0</div>
            <div className="text-sm text-muted-foreground mb-2">
              Enhanced terminal with unique developer features. Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Cmd+P</kbd> for command palette.
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">?? command</Badge>
              <Badge variant="outline">/applets</Badge>
              <Badge variant="outline">export-session</Badge>
              <Badge variant="outline">directory goals</Badge>
            </div>
          </div>

          {/* Directory Goals */}
          <DirectoryGoals 
            currentPath={currentDirectory}
            onCommandSelect={(cmd) => {
              setInput(cmd);
              inputRef.current?.focus();
            }}
          />

          {/* Active Applet */}
          {activeApplet && (
            <div className="mb-4">
              {activeApplet === 'todo' && <TodoApplet onExit={() => setActiveApplet(null)} />}
              {activeApplet === 'timer' && <TimerApplet onExit={() => setActiveApplet(null)} />}
              {activeApplet === 'note' && <NoteApplet onExit={() => setActiveApplet(null)} />}
            </div>
          )}

          {/* Command History */}
          {commands.map((command, index) => (
            <div key={command.id} className="space-y-1">
              {/* Command Memory Timeline */}
              <div className="flex items-center gap-2 group">
                <Prompt />
                <span>{formatCommand(command.input)}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-auto">
                  <Badge variant="secondary" className="text-xs">
                    {command.timestamp.toLocaleTimeString()}
                  </Badge>
                  {command.directory && (
                    <Badge variant="outline" className="text-xs">
                      {command.directory.split('/').pop()}
                    </Badge>
                  )}
                </div>
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

          {/* Command Diff Preview */}
          {lastSimilarCommand && input && input !== lastSimilarCommand && (
            <CommandDiff 
              currentCommand={input}
              previousCommand={lastSimilarCommand}
            />
          )}

          {/* Current Input */}
          <div className="flex items-center gap-2">
            <Prompt />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Update diff preview in real-time
                const similar = findSimilarCommand(e.target.value);
                if (similar !== lastSimilarCommand) {
                  setLastSimilarCommand(similar);
                }
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-foreground"
              placeholder="Type a command, try '?? ls' or '/todo'..."
              autoFocus
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Cmd+P</span>
              <Search className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelect={(cmd) => {
            setInput(cmd);
            inputRef.current?.focus();
          }}
          commandHistory={commands.map(cmd => ({ input: cmd.input, timestamp: cmd.timestamp }))}
        />
      </div>
    </div>
  );
};

export default Terminal;