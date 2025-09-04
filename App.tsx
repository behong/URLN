import React, { useState, useCallback } from 'react';
import { URLForm } from './components/URLForm.tsx';
import { StatusMessage } from './components/StatusMessage.tsx';
import type { Status } from './types.ts';

const App: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // This is a MOCK function to simulate sending data to a backend.
  // In a real application, you would replace this with a `fetch` call
  // to your own server or serverless function which then communicates
  // with the Notion API.
  const sendUrlToNotionBackend = async (url: string): Promise<{ success: boolean; message: string }> => {
    console.log(`Sending URL to backend: ${url}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a successful response from the backend.
    // To test the error case, you can change this to `false`.
    const isSuccess = true; 
    
    if (isSuccess) {
      return {
        success: true,
        message: 'URL이 Notion에 성공적으로 전송되었습니다!',
      };
    } else {
      return {
        success: false,
        message: 'URL 전송에 실패했습니다. 다시 시도해주세요.',
      };
    }
  };

  const handleSubmit = useCallback(async (url: string) => {
    setIsLoading(true);
    setStatus('loading');
    setMessage('Notion으로 URL을 전송하는 중...');

    try {
      // ** IMPORTANT **
      // This function call simulates the API request.
      // Replace `sendUrlToNotionBackend(url)` with your actual backend call, for example:
      //
      // const response = await fetch('https://your-backend-api.com/add-to-notion', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: url })
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      //
      // const result = await response.json();
      // setStatus('success');
      // setMessage(result.message || 'Successfully sent to Notion!');
      
      const result = await sendUrlToNotionBackend(url);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      setStatus('error');
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">URL to Notion</h1>
          <p className="text-lg text-slate-400">저장하고 싶은 URL을 Notion 데이터베이스로 바로 보내세요.</p>
        </header>

        <main className="bg-slate-800 rounded-xl shadow-2xl shadow-cyan-500/10 p-6 md:p-8">
          <URLForm onSubmit={handleSubmit} isLoading={isLoading} />
        </main>

        <footer className="text-center mt-8">
           {status !== 'idle' && (
              <StatusMessage status={status} message={message} />
            )}
        </footer>
      </div>
    </div>
  );
};

export default App;
