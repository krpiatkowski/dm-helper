import { Mistral } from '@mistralai/mistralai';
import type { ChatCompletionRequest } from '@mistralai/mistralai/models/components';
import { useState } from 'react';

import './app.css';
import { NCPCreatorPrompt } from './prompts/npc-creator';
import { renderContent } from './app.helper';
import { marked } from './utils/marked';

const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

type Message = ChatCompletionRequest['messages'][number];

const App = () => {
  const [text, setText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'system', content: NCPCreatorPrompt }]);

  const onClickHandler = async () => {
    const newMessage: Message = { role: 'user', content: text };

    setMessages([...messages, newMessage, { role: 'assistant', content: 'Thinking...' }]);
    const result = await client.chat.stream({
      model: 'pixtral-large-latest',
      messages: [...messages, newMessage],
    });

    let streamedMessage = '';

    for await (const chunk of result) {
      const streamText = chunk.data.choices[0].delta.content;
      if (typeof streamText === 'string') {
        streamedMessage += streamText;
        setMessages([...messages, newMessage, { role: 'assistant', content: streamedMessage }]);
      }
    }
  };

  return (
    <div>
      <div>
        {messages
          .filter((message) => message.role !== 'system')
          .map((message, index) => (
            <div key={index} className={`chat ${message.role === 'user' ? 'chat-start' : 'chat-end'}`}>
              <div
                className={`chat-bubble [&>ul]:ml-10 [&>ul]:list-disc ${message.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-secondary text-left'}`}
                dangerouslySetInnerHTML={{
                  __html: typeof message.content === 'string' ? marked.parse(message.content, { async: false }) : '',
                }}
              />
            </div>
          ))}
      </div>
      <textarea
        className="textarea textarea-primary"
        defaultValue={text}
        placeholder="Chat..."
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <button className="btn btn-accent" onClick={onClickHandler}>
        aest
      </button>
    </div>
  );
};

export default App;
