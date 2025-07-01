
const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-3">
      <div className="px-3 py-2 rounded-lg text-sm flex items-center space-x-1 bg-white border border-gray-200">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
