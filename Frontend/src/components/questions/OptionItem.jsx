// Affiche UNE option (réutilisable dans QuestionCard)
const OptionItem = ({ option, isCorrect }) => {
  return (
    <div className={`flex items-center p-2 rounded border ${
      isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
    }`}>
      <div className={`w-4 h-4 rounded-full border mr-2 ${
        isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-400'
      }`}></div>
      <span className={isCorrect ? 'text-green-800 font-medium' : 'text-gray-700'}>
        {option}
      </span>
    </div>
  );
};
export default OptionItem;