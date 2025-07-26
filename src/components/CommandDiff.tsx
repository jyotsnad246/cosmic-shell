import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';

interface CommandDiffProps {
  currentCommand: string;
  previousCommand: string;
}

const CommandDiff = ({ currentCommand, previousCommand }: CommandDiffProps) => {
  const diffResult = useMemo(() => {
    if (!previousCommand || currentCommand === previousCommand) {
      return null;
    }

    const currentParts = currentCommand.split(' ');
    const previousParts = previousCommand.split(' ');
    const maxLength = Math.max(currentParts.length, previousParts.length);
    
    const differences = [];
    
    for (let i = 0; i < maxLength; i++) {
      const current = currentParts[i] || '';
      const previous = previousParts[i] || '';
      
      if (current !== previous) {
        if (current && previous) {
          differences.push({
            type: 'modified',
            previous,
            current,
            position: i
          });
        } else if (current) {
          differences.push({
            type: 'added',
            current,
            position: i
          });
        } else {
          differences.push({
            type: 'removed',
            previous,
            position: i
          });
        }
      }
    }
    
    return differences;
  }, [currentCommand, previousCommand]);

  if (!diffResult || diffResult.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 mb-2 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-terminal-blue" />
        <span className="font-medium text-terminal-blue">Command Diff</span>
        <Badge variant="secondary" className="text-xs">
          {diffResult.length} change{diffResult.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-terminal-red">-</span>
          <span className="font-mono text-muted-foreground">{previousCommand}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-terminal-green">+</span>
          <span className="font-mono text-foreground">{currentCommand}</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border">
        <div className="flex flex-wrap gap-1">
          {diffResult.map((diff, index) => (
            <Badge 
              key={index} 
              variant={diff.type === 'added' ? 'default' : diff.type === 'removed' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {diff.type === 'added' && `+${diff.current}`}
              {diff.type === 'removed' && `-${diff.previous}`}
              {diff.type === 'modified' && `${diff.previous}→${diff.current}`}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandDiff;