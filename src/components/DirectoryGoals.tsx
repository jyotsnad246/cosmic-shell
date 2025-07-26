import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, GitBranch, Package, Wrench, Code } from 'lucide-react';

interface DirectoryGoal {
  command: string;
  description: string;
  icon: React.ReactNode;
  category: 'build' | 'git' | 'test' | 'dev' | 'deploy';
}

interface DirectoryGoalsProps {
  currentPath: string;
  onCommandSelect: (command: string) => void;
}

const DirectoryGoals = ({ currentPath, onCommandSelect }: DirectoryGoalsProps) => {
  const getGoalsForDirectory = (path: string): DirectoryGoal[] => {
    // Mock directory detection based on path
    if (path.includes('rust') || path.includes('cargo')) {
      return [
        {
          command: 'cargo build',
          description: 'Build the project',
          icon: <Package className="w-4 h-4" />,
          category: 'build'
        },
        {
          command: 'cargo test',
          description: 'Run tests',
          icon: <Wrench className="w-4 h-4" />,
          category: 'test'
        },
        {
          command: 'cargo run',
          description: 'Run the application',
          icon: <Code className="w-4 h-4" />,
          category: 'dev'
        },
        {
          command: 'cargo check',
          description: 'Check for compilation errors',
          icon: <Wrench className="w-4 h-4" />,
          category: 'build'
        }
      ];
    }
    
    if (path.includes('node') || path.includes('js') || path.includes('react')) {
      return [
        {
          command: 'npm install',
          description: 'Install dependencies',
          icon: <Package className="w-4 h-4" />,
          category: 'build'
        },
        {
          command: 'npm run dev',
          description: 'Start development server',
          icon: <Code className="w-4 h-4" />,
          category: 'dev'
        },
        {
          command: 'npm test',
          description: 'Run test suite',
          icon: <Wrench className="w-4 h-4" />,
          category: 'test'
        },
        {
          command: 'npm run build',
          description: 'Build for production',
          icon: <Package className="w-4 h-4" />,
          category: 'build'
        }
      ];
    }
    
    // Default goals for any directory
    return [
      {
        command: 'git status',
        description: 'Check git status',
        icon: <GitBranch className="w-4 h-4" />,
        category: 'git'
      },
      {
        command: 'ls -la',
        description: 'List directory contents',
        icon: <Folder className="w-4 h-4" />,
        category: 'dev'
      },
      {
        command: 'git log --oneline -10',
        description: 'Recent commits',
        icon: <GitBranch className="w-4 h-4" />,
        category: 'git'
      }
    ];
  };

  const goals = getGoalsForDirectory(currentPath);
  
  if (goals.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'build': return 'text-terminal-blue';
      case 'git': return 'text-terminal-orange';
      case 'test': return 'text-terminal-green';
      case 'dev': return 'text-terminal-purple';
      case 'deploy': return 'text-terminal-red';
      default: return 'text-terminal-cyan';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Folder className="w-4 h-4 text-terminal-blue" />
        <span className="font-medium text-terminal-blue">Directory Quick Actions</span>
        <Badge variant="secondary" className="text-xs">
          {currentPath.split('/').pop() || 'root'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {goals.map((goal, index) => (
          <Button
            key={index}
            variant="ghost"
            className="h-auto p-3 flex items-start gap-3 justify-start text-left"
            onClick={() => onCommandSelect(goal.command)}
          >
            <div className={getCategoryColor(goal.category)}>
              {goal.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm font-medium">{goal.command}</div>
              <div className="text-xs text-muted-foreground mt-1">{goal.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DirectoryGoals;