import { MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isMe: boolean;
}

export default function Message({ message, isMe }: MessageProps) {
  const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
  const timeString = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (message.type === 'status') {
    return (
      <div className="text-center text-xs text-gray-400 my-2 italic">
        {message.user} {message.text} - {timeString}
      </div>
    );
  }

  const alignClass = isMe 
    ? 'ml-auto bg-blue-500 text-white' 
    : 'mr-auto bg-gray-200 text-gray-800';
  const userColor = isMe ? 'text-blue-100' : 'text-blue-600';
  const timeColor = isMe ? 'text-blue-200' : 'text-gray-500';

  return (
    <div className={`p-3 rounded-lg shadow-sm border border-gray-100 max-w-[80%] ${alignClass}`}>
      <div className="flex justify-between items-baseline mb-1 gap-4">
        <span className={`font-bold text-sm ${userColor}`}>{message.user}</span>
        <span className={`text-xs ${timeColor}`}>{timeString}</span>
      </div>
      <p className="break-words">{message.text}</p>
    </div>
  );
}