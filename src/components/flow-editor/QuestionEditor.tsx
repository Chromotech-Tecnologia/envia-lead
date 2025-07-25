
import QuestionDragDrop from './QuestionDragDrop';
import QuestionConfig from './QuestionConfig';

interface QuestionEditorProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionEditor = ({ flowData, setFlowData }: QuestionEditorProps) => {
  return (
    <div className="space-y-6">
      <QuestionConfig flowData={flowData} setFlowData={setFlowData} />
      <QuestionDragDrop flowData={flowData} setFlowData={setFlowData} />
    </div>
  );
};

export default QuestionEditor;
