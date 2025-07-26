import { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Terminal, Code, Bookmark, Zap } from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  description: string;
  category: 'history' | 'script' | 'action' | 'alias';
  value: string;
  timestamp?: Date;
  icon: React.ReactNode;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: string) => void;
  commandHistory: Array<{ input: string; timestamp: Date }>;
}

const CommandPalette = ({ isOpen, onClose, onSelect, commandHistory }: CommandPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockScripts = [
    { name: 'build-project', description: 'Build and test the project', command: 'cargo build --release && cargo test' },
    { name: 'git-sync', description: 'Pull, merge, and push changes', command: 'git pull origin main && git push' },
    { name: 'deploy-staging', description: 'Deploy to staging environment', command: 'docker build . && kubectl apply -f staging.yaml' }
  ];

  const mockActions = [
    { name: 'Clear Terminal', description: 'Clear the terminal screen', command: 'clear' },
    { name: 'Show Git Status', description: 'Display current git status', command: 'git status' },
    { name: 'List Files', description: 'List all files in current directory', command: 'ls -la' }
  ];

  const mockAliases = [
    { name: 'll', description: 'Long listing format', command: 'ls -la' },
    { name: 'gs', description: 'Git status shortcut', command: 'git status' },
    { name: 'gp', description: 'Git push shortcut', command: 'git push' }
  ];

  const paletteItems: PaletteItem[] = [
    // Recent commands
    ...commandHistory.slice(0, 5).map((cmd, index) => ({
      id: `history-${index}`,
      title: cmd.input,
      description: `Executed ${cmd.timestamp.toLocaleTimeString()}`,
      category: 'history' as const,
      value: cmd.input,
      timestamp: cmd.timestamp,
      icon: <Clock className="w-4 h-4 text-terminal-blue" />
    })),
    // Scripts
    ...mockScripts.map(script => ({
      id: `script-${script.name}`,
      title: script.name,
      description: script.description,
      category: 'script' as const,
      value: script.command,
      icon: <Code className="w-4 h-4 text-terminal-green" />
    })),
    // Actions
    ...mockActions.map(action => ({
      id: `action-${action.name}`,
      title: action.name,
      description: action.description,
      category: 'action' as const,
      value: action.command,
      icon: <Zap className="w-4 h-4 text-terminal-purple" />
    })),
    // Aliases
    ...mockAliases.map(alias => ({
      id: `alias-${alias.name}`,
      title: alias.name,
      description: alias.description,
      category: 'alias' as const,
      value: alias.command,
      icon: <Bookmark className="w-4 h-4 text-terminal-orange" />
    }))
  ];

  const filteredItems = paletteItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: PaletteItem) => {
    onSelect(item.value);
    onClose();
    setSearchQuery('');
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'history': return 'Recent Commands';
      case 'script': return 'Project Scripts';
      case 'action': return 'Quick Actions';
      case 'alias': return 'Aliases';
      default: return 'Commands';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'history': return <Clock className="w-4 h-4" />;
      case 'script': return <Code className="w-4 h-4" />;
      case 'action': return <Zap className="w-4 h-4" />;
      case 'alias': return <Bookmark className="w-4 h-4" />;
      default: return <Terminal className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border-0">
          <CommandInput 
            placeholder="Search commands, scripts, and actions..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
          />
          <CommandList className="max-h-96">
            <CommandEmpty>No commands found.</CommandEmpty>
            
            {['history', 'script', 'action', 'alias'].map(category => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              
              return (
                <CommandGroup key={category} heading={
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span>{getCategoryName(category)}</span>
                  </div>
                }>
                  {categoryItems.map(item => (
                    <CommandItem
                      key={item.id}
                      value={item.title + ' ' + item.description}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 py-3"
                    >
                      {item.icon}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{item.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                        <div className="text-xs text-terminal-cyan font-mono mt-1">{item.value}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;