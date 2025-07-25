
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicSettings from './BasicSettings';
import UrlSettings from './UrlSettings';
import EmailSettings from './EmailSettings';
import QuestionEditor from './QuestionEditor';
import DesignSettings from './DesignSettings';
import IntegrationCode from './IntegrationCode';
import WelcomeMessageSettings from './WelcomeMessageSettings';

interface FlowEditorTabsProps {
  flow?: any;
  flowData: any;
  setFlowData: (data: any) => void;
}

const FlowEditorTabs = ({ flow, flowData, setFlowData }: FlowEditorTabsProps) => {
  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Configurações Básicas</TabsTrigger>
        <TabsTrigger value="questions">Perguntas</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="integration">Integração</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-6">
        <BasicSettings flowData={flowData} setFlowData={setFlowData} />
        <UrlSettings flowData={flowData} setFlowData={setFlowData} />
        <EmailSettings flowData={flowData} setFlowData={setFlowData} />
      </TabsContent>

      <TabsContent value="questions" className="space-y-6">
        <WelcomeMessageSettings flowData={flowData} setFlowData={setFlowData} />
        <QuestionEditor flowData={flowData} setFlowData={setFlowData} />
      </TabsContent>

      <TabsContent value="design" className="space-y-6">
        <DesignSettings flowData={flowData} setFlowData={setFlowData} />
      </TabsContent>

      <TabsContent value="integration" className="space-y-6">
        <IntegrationCode flow={flow} flowData={flowData} />
      </TabsContent>
    </Tabs>
  );
};

export default FlowEditorTabs;
