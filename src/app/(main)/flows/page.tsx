import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap, Database, Mail, UserPlus } from "lucide-react";

const FlowNode = ({
  icon: Icon,
  title,
  content,
  className,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
  className?: string;
}) => (
  <Card className={`absolute w-64 shadow-lg ${className}`}>
    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
      <Icon className="h-5 w-5 text-primary" />
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{content}</p>
    </CardContent>
  </Card>
);

const Arrow = ({ className }: { className?: string }) => (
  <svg
    className={`absolute text-border ${className}`}
    width="120"
    height="80"
    viewBox="0 0 120 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 5C5 5 86.6667 5 115 75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      markerEnd="url(#arrowhead)"
    />
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="0"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
      </marker>
    </defs>
  </svg>
);


export default function FlowBuilderPage() {
  return (
    <div className="flex h-[70vh] w-full flex-col">
       <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Visual API Flow Builder</h1>
        <p className="text-muted-foreground">Drag-and-drop endpoints to simulate workflows.</p>
      </div>
      <div className="relative flex-1 rounded-lg border bg-card/50 p-4">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
        
        <FlowNode
          icon={UserPlus}
          title="Trigger: User Signup"
          content="Starts when a new user signs up."
          className="left-10 top-10"
        />

        <Arrow className="left-[18rem] top-28" />

        <FlowNode
          icon={Zap}
          title="API: POST /users"
          content="Creates a new user record."
          className="left-[24rem] top-36"
        />

        <Arrow className="left-[18rem] top-[22rem] rotate-180" />

        <FlowNode
          icon={Database}
          title="Database: Save User"
          content="Saves user data to Firestore."
          className="left-10 top-[24rem]"
        />

        <Arrow className="left-[24rem] top-[22rem] -scale-y-100" />
        
        <FlowNode
          icon={Mail}
          title="API: Send Welcome Email"
          content="Sends a welcome email via an API."
          className="left-[44rem] top-36"
        />
      </div>
    </div>
  );
}
