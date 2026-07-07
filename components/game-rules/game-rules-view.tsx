type RulesetSection = {
  title: string;
  content: string;
};

type GameRulesViewProps = {
  gameName: string;
  sections: RulesetSection[];
};

function GameRulesView({ gameName, sections }: GameRulesViewProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-mono text-lg font-bold">{gameName} Rules</h2>
      <div className="divide-y divide-border border border-border">
        {sections.map((section) => (
          <div key={section.title} className="py-4 px-4 space-y-1">
            <h3 className="font-mono text-sm font-semibold text-foreground/80">
              {section.title}
            </h3>
            <p className="font-mono text-sm text-foreground/60 leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { GameRulesView, type GameRulesViewProps, type RulesetSection };
