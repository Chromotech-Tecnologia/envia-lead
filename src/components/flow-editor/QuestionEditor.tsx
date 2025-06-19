
import QuestionDragDrop from './QuestionDragDrop';

interface QuestionEditorProps {
  flowData: any;
  setFlowData: (data: any) => void;
}

const QuestionEditor = ({ flowData, setFlowData }: QuestionEditorProps) => {
  return <QuestionDragDrop flowData={flowData} setFlowData={setFlowData} />;
};

export default QuestionEditor;
