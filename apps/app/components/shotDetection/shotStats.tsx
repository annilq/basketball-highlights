interface DetectionStatsProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
}

export function DetectionStats({
  label,
  value,
  icon: Icon,
}: DetectionStatsProps) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
