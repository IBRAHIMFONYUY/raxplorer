import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap, Database, Mail, UserPlus, ArrowRight } from "lucide-react";

const FlowNode = ({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
}) => (
  <Card className="w-72 shadow-lg bg-card/80 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
      <div className="p-3 rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    </CardHeader>
  </Card>
);

const ArrowConnector = () => (
  <div className="flex items-center justify-center h-20">
    <ArrowRight className="h-8 w-8 text-muted-foreground/50" />
  </div>
);

export default function FlowBuilderPage() {
  return (
    <div className="flex h-[80vh] w-full flex-col">
       <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Visual API Flow Builder</h1>
        <p className="text-muted-foreground">Visualize and chain API endpoints to simulate complex workflows.</p>
      </div>
      <div className="relative flex-1 rounded-lg border bg-card/50 p-8 overflow-auto">
        <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
        
        <div className="relative flex flex-col items-center gap-0">
          <FlowNode
            icon={UserPlus}
            title="Trigger: User Signup"
            content="Starts when a new user signs up on your app."
          />
          <ArrowConnector />
          <FlowNode
            icon={Zap}
            title="API Call: POST /users"
            content="Creates a new user record in the system."
          />
          <ArrowConnector />
          <div className="flex items-start gap-12">
            <div className="flex flex-col items-center">
              <div className="h-10 w-px bg-muted-foreground/50" />
              <ArrowRight className="h-8 w-8 text-muted-foreground/50 -rotate-90" />
              <div className="h-10 w-px bg-muted-foreground/50" />
              <FlowNode
                icon={Database}
                title="Database: Save User"
                content="Saves user profile data to Firestore."
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-px bg-muted-foreground/50" />
              <ArrowRight className="h-8 w-8 text-muted-foreground/50 rotate-90" />
              <div className="h-10 w-px bg-muted-foreground/50" />
              <FlowNode
                icon={Mail}
                title="API Call: Send Welcome Email"
                content="Sends a welcome email via a third-party API."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
