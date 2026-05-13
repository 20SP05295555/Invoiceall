
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, MoreHorizontal, Reply, Trash2, Archive, Star } from 'lucide-react';
import { INITIAL_EMAILS, CURRENT_CUSTOMER, SAMPLE_ORDER } from '../constants.ts';
import { EmailMessage } from '../types.ts';
import { generateEmailReply } from '../services/geminiService.ts';

const EmailConversation: React.FC = () => {
  const [emails, setEmails] = useState<EmailMessage[]>(INITIAL_EMAILS);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!replyText.trim()) return;

    const newEmail: EmailMessage = {
      id: `msg_${Date.now()}`,
      from: 'Emma Kitchen', // Acting as support
      fromEmail: 'customerservice@hobfurniture.co.uk',
      to: CURRENT_CUSTOMER.name,
      subject: emails[0].subject,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
      body: replyText,
      isIncoming: true
    };

    setEmails([...emails, newEmail]);
    setReplyText('');
  };

  const handleAIDraft = async () => {
    setIsGenerating(true);
    const history = emails.map(e => `From: ${e.from}\nBody: ${e.body}`).join('\n\n');
    const context = `Order Item: ${SAMPLE_ORDER.items[0].description}, Details: ${SAMPLE_ORDER.items[0].details.join(', ')}.`;
    
    const draft = await generateEmailReply(history, CURRENT_CUSTOMER.name, context);
    setReplyText(draft);
    setIsGenerating(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [emails]);

  return (
    <div className="max-w-6xl mx-auto h-[600px] sm:h-[800px] flex bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      {/* Sidebar List (Mock) */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
            <button className="w-full bg-gray-900 text-white py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition">
                New Message
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
             <div className="p-3 bg-blue-50 border-l-4 border-blue-600 cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-900 truncate">Arthur Cook</span>
                    <span className="text-xs text-gray-500">9:15 AM</span>
                </div>
                <div className="text-xs font-medium text-gray-800 mb-1 truncate">Re: Order #2025-376</div>
                <div className="text-xs text-gray-500 line-clamp-2">Hi Emma, Thanks for the confirmation. I just wanted to...</div>
             </div>
             {[1, 2, 3].map(i => (
                 <div key={i} className="p-3 border-b border-gray-100 hover:bg-gray-100 cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-gray-700">Supplier A</span>
                        <span className="text-xs text-gray-400">Sep 12</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Invoice Attached</div>
                    <div className="text-xs text-gray-400 truncate">Please find attached the invoice for...</div>
                 </div>
             ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Email Header Tooling */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
            <h2 className="text-lg font-bold text-gray-800 truncate pr-4">{emails[0].subject}</h2>
            <div className="flex text-gray-400 gap-4">
                <Archive className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
                <Trash2 className="w-5 h-5 hover:text-red-500 cursor-pointer" />
                <MoreHorizontal className="w-5 h-5 hover:text-gray-600 cursor-pointer" />
            </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {emails.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.isIncoming ? 'flex-row-reverse' : ''}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.isIncoming ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                  {msg.isIncoming ? <span className="font-bold text-sm">EK</span> : <User className="w-5 h-5" />}
               </div>
               
               <div className={`flex-1 max-w-[80%] rounded-lg p-5 shadow-sm border ${msg.isIncoming ? 'bg-white border-indigo-100' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{msg.from}</span>
                        <span className="text-gray-400 text-xs ml-2">&lt;{msg.fromEmail}&gt;</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{msg.date}</span>
                          {!msg.isIncoming && <Star className="w-4 h-4 text-gray-300 hover:text-yellow-400 cursor-pointer" />}
                      </div>
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {msg.body}
                  </div>
               </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply Composer */}
        <div className="p-4 bg-white border-t border-gray-200">
            <div className="relative rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="block w-full border-0 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm h-32 resize-none"
                />
                
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-b-lg border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleAIDraft}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                                isGenerating 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}
                        >
                            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Gemini is thinking...' : 'Draft with AI'}
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-gray-600">
                            <Reply className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={!replyText.trim()}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConversation;