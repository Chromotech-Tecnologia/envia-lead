
import { Button } from "@/components/ui/button";
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { defaultQuestions } from '@/data/defaultQuestions';

interface ChatQuestionsListProps {
  currentStep: number;
  responses: Record<number, string>;
  isTyping: boolean;
  onResponse: (response: string) => void;
}

const ChatQuestionsList = ({ currentStep, responses, isTyping, onResponse }: ChatQuestionsListProps) => {
  return (
    <>
      {defaultQuestions.slice(0, currentStep + 1).map((question, index) => (
        <div key={question.id} className="space-y-3">
          <ChatMessage
            message={question.title}
            isBot={true}
            time={`09:0${index + 1}`}
          />

          {responses[index] && (
            <ChatMessage
              message={responses[index]}
              isBot={false}
              time={`09:0${index + 1}`}
            />
          )}

          {index === currentStep && question.type === 'single' && !responses[index] && (
            <div className="space-y-2 ml-10">
              {question.options?.map((option, optIndex) => (
                <Button
                  key={optIndex}
                  variant="outline"
                  size="sm"
                  className="block w-fit text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => onResponse(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}

      {isTyping && <TypingIndicator />}
    </>
  );
};

export default ChatQuestionsList;
