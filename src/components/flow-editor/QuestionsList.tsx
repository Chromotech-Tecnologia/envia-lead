
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import QuestionCard from './QuestionCard';

interface QuestionsListProps {
  questions: any[];
  editingQuestion: number | null;
  onDragEnd: (result: any) => void;
  onEditQuestion: (id: number) => void;
  onSaveQuestion: () => void;
  onDeleteQuestion: (id: number) => void;
  onUpdateQuestion: (id: number, updates: any) => void;
}

const QuestionsList = ({
  questions,
  editingQuestion,
  onDragEnd,
  onEditQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  onUpdateQuestion
}: QuestionsListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {questions
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? "opacity-70" : ""}
                    >
                      <QuestionCard
                        question={question}
                        index={index + 1}
                        isEditing={editingQuestion === question.id}
                        onEdit={() => onEditQuestion(question.id)}
                        onSave={onSaveQuestion}
                        onDelete={() => onDeleteQuestion(question.id)}
                        onUpdate={(updates) => onUpdateQuestion(question.id, updates)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default QuestionsList;
