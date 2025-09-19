import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Zap,
  Webhook,
  ArrowRight,
  MousePointer,
  Database,
  Mail,
  ZoomIn,
  ZoomOut,
  Code,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const FlowNode = ({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ElementType;
  title: string;
  content: string;
}) => (
  <Card className="w-72 shadow-lg bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 cursor-pointer transition-colors">
    <CardHeader className="flex flex-row items-center gap-4 space-y-0">
      <div className="p-3 rounded-lg bg-primary/10 text-primary">
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
  <div className="flex items-center justify-center h-16">
    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
  </div>
);

const ComponentLibraryItem = ({
  icon: Icon,
  name,
  description,
}: {
  icon: React.ElementType;
  name: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary cursor-grab">
    <Icon className="h-5 w-5 mt-1 text-primary" />
    <div>
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default function FlowBuilderPage() {
  return (
    <div className="flex h-[calc(100vh-5rem)] w-full flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Visual API Flow Builder
        </h1>
        <p className="text-muted-foreground">
          Design, automate, and visualize complex API workflows.
        </p>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px] gap-4">
        {/* Component Library */}
        <Card className="hidden md:flex flex-col">
          <CardHeader>
            <CardTitle>Components</CardTitle>
            <CardDescription>Drag nodes onto the canvas.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                Triggers
              </h4>
              <div className="space-y-1">
                <ComponentLibraryItem
                  icon={Webhook}
                  name="Webhook"
                  description="Start flow from an HTTP request."
                />
                <ComponentLibraryItem
                  icon={MousePointer}
                  name="Manual"
                  description="Trigger flow manually."
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                API Calls
              </h4>
              <div className="space-y-1">
                <ComponentLibraryItem
                  icon={Zap}
                  name="API Request"
                  description="Call any internal or external API."
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                Logic
              </h4>
              <div className="space-y-1">
                <ComponentLibraryItem
                  icon={GitBranch}
                  name="Conditional"
                  description="Branch flow based on conditions."
                />
                 <ComponentLibraryItem
                  icon={Code}
                  name="Custom Script"
                  description="Run custom JavaScript/TypeScript."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Canvas */}
        <div className="relative rounded-lg border bg-card/50 p-8 overflow-auto">
          <div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
          <div className="relative flex flex-col items-center">
            <FlowNode
              icon={Webhook}
              title="Trigger: On User Signup"
              content="Webhook received at /api/v1/users"
            />
            <ArrowConnector />
            <FlowNode
              icon={Zap}
              title="API Call: Create User Record"
              content="POST /users"
            />
            <ArrowConnector />
            <FlowNode
              icon={Mail}
              title="API Call: Send Welcome Email"
              content="POST /send-email"
            />
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground font-medium">100%</span>
            <Button variant="outline" size="icon">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Properties Panel */}
        <Card className="hidden lg:flex flex-col">
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>
              Configure the selected 'Webhook' node.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="node-name">Node Name</Label>
              <Input id="node-name" defaultValue="Trigger: On User Signup" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex items-center rounded-md border bg-secondary">
                 <span className="px-3 text-sm font-medium text-muted-foreground">POST</span>
                 <Separator orientation="vertical" className="h-6" />
                 <Input readOnly value="/api/v1/users" className="border-0 bg-transparent" />
              </div>
               <p className="text-xs text-muted-foreground">This is the endpoint that will trigger the flow.</p>
            </div>
            <div className="space-y-2">
               <Label>Authentication</Label>
               <p className="text-sm text-muted-foreground">None</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}