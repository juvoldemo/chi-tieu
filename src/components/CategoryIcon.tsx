import * as Icons from 'lucide-react';

interface CategoryIconProps {
  icon?: string;
  color?: string;
  size?: number;
}

export function CategoryIcon({ icon = 'CircleEllipsis', color = '#005BAA', size = 18 }: CategoryIconProps) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[icon] ?? Icons.CircleEllipsis;

  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/50" style={{ color }}>
      <Icon size={size} strokeWidth={2.1} />
    </span>
  );
}
