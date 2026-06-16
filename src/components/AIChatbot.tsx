import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, User, Bot, Loader2, Phone, Mic, MicOff, Image, FileText, Paperclip, StopCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "document" | "audio";
  fileName?: string;
  fileUrl?: string;
  audioUrl?: string;
}

interface VisitorInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type CollectionStep = 'idle' | 'firstName' | 'lastName' | 'email' | 'phone' | 'complete';

const translations = {
  fr: {
    title: "KAPITA",
    subtitle: "Assistant AgriCapital",
    placeholder: "Tapez ou parlez...",
    welcome: "Bonjour ! Je suis KAPITA, votre assistant intelligent AgriCapital. Avant de commencer, puis-je avoir votre prénom ?",
    askFirstName: "Quel est votre prénom ?",
    askLastName: "Merci ! Et votre nom de famille ?",
    askEmail: "Parfait ! Votre adresse email ? (optionnel, tapez 'passer' pour ignorer)",
    askPhone: "Et votre numéro de téléphone ? (optionnel, tapez 'passer' pour ignorer)",
    thankYou: "Merci {name} ! Comment puis-je vous aider aujourd'hui ? Je peux échanger par texte, par voix, ou analyser vos images et documents.",
    contactTeam: "Contacter l'équipe",
    close: "Fermer",
    recording: "Enregistrement en cours...",
    stopRecording: "Arrêter",
    attachFile: "Joindre un fichier",
    voiceMessage: "Message vocal",
    processingVoice: "Traitement de la voix...",
    processingFile: "Analyse du fichier...",
    imageReceived: "Image reçue",
    documentReceived: "Document reçu",
    skip: "passer",
  },
  en: {
    title: "KAPITA",
    subtitle: "AgriCapital Assistant",
    placeholder: "Type or speak...",
    welcome: "Hello! I'm KAPITA, your intelligent AgriCapital assistant. Before we start, may I have your first name?",
    askFirstName: "What is your first name?",
    askLastName: "Thanks! And your last name?",
    askEmail: "Great! Your email address? (optional, type 'skip' to pass)",
    askPhone: "And your phone number? (optional, type 'skip' to pass)",
    thankYou: "Thank you {name}! How can I help you today? I can chat via text, voice, or analyze your images and documents.",
    contactTeam: "Contact the team",
    close: "Close",
    recording: "Recording...",
    stopRecording: "Stop",
    attachFile: "Attach file",
    voiceMessage: "Voice message",
    processingVoice: "Processing voice...",
    processingFile: "Analyzing file...",
    imageReceived: "Image received",
    documentReceived: "Document received",
    skip: "skip",
  },
  ar: {
    title: "كابيتا",
    subtitle: "مساعد أجريكابيتال",
    placeholder: "اكتب أو تحدث...",
    welcome: "مرحباً! أنا كابيتا، مساعدك الذكي في أجريكابيتال. قبل أن نبدأ، هل يمكنني معرفة اسمك الأول؟",
    askFirstName: "ما هو اسمك الأول؟",
    askLastName: "شكراً! واسم عائلتك؟",
    askEmail: "ممتاز! بريدك الإلكتروني؟ (اختياري، اكتب 'تخطي' للتجاوز)",
    askPhone: "ورقم هاتفك؟ (اختياري، اكتب 'تخطي' للتجاوز)",
    thankYou: "شكراً {name}! كيف يمكنني مساعدتك اليوم؟",
    contactTeam: "اتصل بالفريق",
    close: "إغلاق",
    recording: "جاري التسجيل...",
    stopRecording: "إيقاف",
    attachFile: "إرفاق ملف",
    voiceMessage: "رسالة صوتية",
    processingVoice: "معالجة الصوت...",
    processingFile: "تحليل الملف...",
    imageReceived: "تم استلام الصورة",
    documentReceived: "تم استلام المستند",
    skip: "تخطي",
  },
  es: {
    title: "KAPITA",
    subtitle: "Asistente AgriCapital",
    placeholder: "Escribe o habla...",
    welcome: "¡Hola! Soy KAPITA, tu asistente inteligente de AgriCapital. Antes de empezar, ¿puedo saber tu nombre?",
    askFirstName: "¿Cuál es tu nombre?",
    askLastName: "¡Gracias! ¿Y tu apellido?",
    askEmail: "¡Perfecto! ¿Tu email? (opcional, escribe 'saltar' para omitir)",
    askPhone: "¿Y tu teléfono? (opcional, escribe 'saltar' para omitir)",
    thankYou: "¡Gracias {name}! ¿Cómo puedo ayudarte hoy?",
    contactTeam: "Contactar equipo",
    close: "Cerrar",
    recording: "Grabando...",
    stopRecording: "Detener",
    attachFile: "Adjuntar archivo",
    voiceMessage: "Mensaje de voz",
    processingVoice: "Procesando voz...",
    processingFile: "Analizando archivo...",
    imageReceived: "Imagen recibida",
    documentReceived: "Documento recibido",
    skip: "saltar",
  },
  de: {
    title: "KAPITA",
    subtitle: "AgriCapital Assistent",
    placeholder: "Tippen oder sprechen...",
    welcome: "Hallo! Ich bin KAPITA, Ihr intelligenter AgriCapital-Assistent. Bevor wir anfangen, darf ich Ihren Vornamen erfahren?",
    askFirstName: "Wie ist Ihr Vorname?",
    askLastName: "Danke! Und Ihr Nachname?",
    askEmail: "Super! Ihre E-Mail? (optional, tippen Sie 'überspringen' zum Auslassen)",
    askPhone: "Und Ihre Telefonnummer? (optional, tippen Sie 'überspringen' zum Auslassen)",
    thankYou: "Danke {name}! Wie kann ich Ihnen heute helfen?",
    contactTeam: "Team kontaktieren",
    close: "Schließen",
    recording: "Aufnahme läuft...",
    stopRecording: "Stoppen",
    attachFile: "Datei anhängen",
    voiceMessage: "Sprachnachricht",
    processingVoice: "Sprache wird verarbeitet...",
    processingFile: "Datei wird analysiert...",
    imageReceived: "Bild erhalten",
    documentReceived: "Dokument erhalten",
    skip: "überspringen",
  },
  zh: {
    title: "KAPITA",
    subtitle: "AgriCapital助手",
    placeholder: "输入或说话...",
    welcome: "您好！我是KAPITA，您的AgriCapital智能助手。在开始之前，请问您的名字是？",
    askFirstName: "您的名字是？",
    askLastName: "谢谢！您的姓氏是？",
    askEmail: "太好了！您的邮箱？（可选，输入'跳过'可忽略）",
    askPhone: "您的电话号码？（可选，输入'跳过'可忽略）",
    thankYou: "谢谢{name}！今天我能帮您什么？",
    contactTeam: "联系团队",
    close: "关闭",
    recording: "录音中...",
    stopRecording: "停止",
    attachFile: "附加文件",
    voiceMessage: "语音消息",
    processingVoice: "处理语音中...",
    processingFile: "分析文件中...",
    imageReceived: "已收到图片",
    documentReceived: "已收到文档",
    skip: "跳过",
  },
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [visitorId] = useState(() => `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  // Contact collection state
  const [collectionStep, setCollectionStep] = useState<CollectionStep>('idle');
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [hasCollectedInfo, setHasCollectedInfo] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;
  const isRTL = language === "ar";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.welcome }]);
      setCollectionStep('firstName');
    }
  }, [isOpen, t.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save visitor contact to database
  const saveVisitorContact = useCallback(async (info: VisitorInfo) => {
    try {
      await supabase.from('visitor_contacts').insert({
        session_id: visitorId,
        first_name: info.firstName || null,
        last_name: info.lastName || null,
        email: info.email && info.email.toLowerCase() !== t.skip ? info.email : null,
        phone: info.phone && info.phone.toLowerCase() !== t.skip ? info.phone : null,
        language: language,
        collected_via: 'chatbot',
      });
      console.log('Visitor contact saved');
    } catch (error) {
      console.error('Error saving visitor contact:', error);
    }
  }, [visitorId, language, t.skip]);

  // Handle contact collection responses
  const handleCollectionResponse = useCallback((userInput: string) => {
    const trimmedInput = userInput.trim();
    const isSkip = trimmedInput.toLowerCase() === t.skip.toLowerCase();
    
    switch (collectionStep) {
      case 'firstName':
        setVisitorInfo(prev => ({ ...prev, firstName: trimmedInput }));
        setMessages(prev => [...prev, 
          { role: "user", content: trimmedInput },
          { role: "assistant", content: t.askLastName }
        ]);
        setCollectionStep('lastName');
        return true;
        
      case 'lastName':
        setVisitorInfo(prev => ({ ...prev, lastName: trimmedInput }));
        setMessages(prev => [...prev, 
          { role: "user", content: trimmedInput },
          { role: "assistant", content: t.askEmail }
        ]);
        setCollectionStep('email');
        return true;
        
      case 'email':
        setVisitorInfo(prev => ({ ...prev, email: isSkip ? '' : trimmedInput }));
        setMessages(prev => [...prev, 
          { role: "user", content: trimmedInput },
          { role: "assistant", content: t.askPhone }
        ]);
        setCollectionStep('phone');
        return true;
        
      case 'phone':
        const finalInfo = { ...visitorInfo, phone: isSkip ? '' : trimmedInput };
        setVisitorInfo(finalInfo);
        
        const thankYouMsg = t.thankYou.replace('{name}', visitorInfo.firstName || 'ami(e)');
        setMessages(prev => [...prev, 
          { role: "user", content: trimmedInput },
          { role: "assistant", content: thankYouMsg }
        ]);
        
        // Save to database
        saveVisitorContact(finalInfo);
        
        setCollectionStep('complete');
        setHasCollectedInfo(true);
        return true;
        
      default:
        return false;
    }
  }, [collectionStep, visitorInfo, t, saveVisitorContact]);

  // Browser TTS fallback
  const speakWithBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 500));
    const langMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-SA', es: 'es-ES', de: 'de-DE', zh: 'zh-CN' };
    utterance.lang = langMap[language] || 'fr-FR';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  }, [language]);

  // Text-to-Speech function with ElevenLabs + browser fallback
  const speakText = useCallback(async (text: string) => {
    if (!isTTSEnabled || !text || text.length < 10) return;
    
    try {
      setIsPlayingAudio(true);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: text.slice(0, 500), language }),
      });

      // Check if response is JSON (error/fallback) or audio
      const contentType = response.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data?.fallback) {
          console.warn("ElevenLabs unavailable, using browser TTS");
          speakWithBrowser(text);
          return;
        }
        setIsPlayingAudio(false);
        return;
      }

      if (!response.ok) {
        console.warn("TTS failed, falling back to browser");
        speakWithBrowser(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        speakWithBrowser(text);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      speakWithBrowser(text);
    }
  }, [isTTSEnabled, language, speakWithBrowser]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
    }
  }, []);

  const streamChat = useCallback(async (userMessages: Message[], attachedFile?: { type: string; content: string; name: string }) => {
    // Add visitor info to context if collected
    const visitorContext = hasCollectedInfo 
      ? `\n[Visiteur: ${visitorInfo.firstName} ${visitorInfo.lastName}${visitorInfo.email ? `, Email: ${visitorInfo.email}` : ''}${visitorInfo.phone ? `, Tél: ${visitorInfo.phone}` : ''}]`
      : '';

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages.map(m => ({ role: m.role, content: m.content })), 
        visitorId, 
        language,
        attachment: attachedFile,
        visitorContext,
      }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1) {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (assistantContent && isTTSEnabled) {
      speakText(assistantContent);
    }

    return assistantContent;
  }, [visitorId, language, isTTSEnabled, speakText, hasCollectedInfo, visitorInfo]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Handle contact collection flow first
    if (collectionStep !== 'idle' && collectionStep !== 'complete') {
      const handled = handleCollectionResponse(input.trim());
      if (handled) {
        setInput("");
        return;
      }
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(newMessages.filter(m => 
        m.content !== t.welcome && 
        m.content !== t.askFirstName &&
        m.content !== t.askLastName &&
        m.content !== t.askEmail &&
        m.content !== t.askPhone &&
        !m.content.includes(t.thankYou.split('{name}')[0])
      ));
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre équipe au 05 64 55 17 17." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      // First, transcribe the audio using ElevenLabs
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        // Extract base64 content after the data URL prefix
        const base64Audio = base64Data.split(',')[1];
        
        try {
          // Call transcription edge function
          const transcribeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;
          const transcribeResponse = await fetch(transcribeUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              audio: base64Audio,
              mimeType: audioBlob.type 
            }),
          });
          
          if (!transcribeResponse.ok) {
            throw new Error("Transcription failed");
          }
          
          const transcribeResult = await transcribeResponse.json();
          const transcribedText = transcribeResult.text;
          
          if (!transcribedText || transcribedText.trim() === '') {
            setMessages(prev => [...prev, { role: "assistant", content: "Je n'ai pas pu comprendre votre message vocal. Pourriez-vous réessayer ou écrire votre question ?" }]);
            setIsProcessingVoice(false);
            return;
          }
          
          // Handle contact collection flow with transcribed text
          if (collectionStep !== 'idle' && collectionStep !== 'complete') {
            const handled = handleCollectionResponse(transcribedText.trim());
            if (handled) {
              setIsProcessingVoice(false);
              return;
            }
          }
          
          // Now process the transcribed text as a regular message
          const userMessage: Message = { 
            role: "user", 
            content: `🎤 ${transcribedText}`,
            type: "audio"
          };
          const newMessages = [...messages, userMessage];
          setMessages(newMessages);
          setIsLoading(true);

          try {
            await streamChat(newMessages.filter(m => 
              m.content !== t.welcome && 
              !m.content.includes(t.askFirstName) &&
              !m.content.includes(t.askLastName) &&
              !m.content.includes(t.askEmail) &&
              !m.content.includes(t.askPhone) &&
              !m.content.includes(t.thankYou.split('{name}')[0])
            ));
          } catch (error) {
            console.error("Voice chat error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Désolé, je n'ai pas pu traiter votre message. Veuillez réessayer." }]);
          } finally {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Transcription error:", error);
          setMessages(prev => [...prev, { role: "assistant", content: "Désolé, je n'ai pas pu transcrire votre message vocal. Veuillez réessayer ou écrire votre question." }]);
        } finally {
          setIsProcessingVoice(false);
        }
      };
    } catch (error) {
      console.error("Error processing voice:", error);
      toast.error("Erreur lors du traitement de la voix");
      setIsProcessingVoice(false);
    }
  };

  // File handling
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Le fichier est trop volumineux (max 5MB)");
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isDocument = file.type === 'application/pdf' || 
                       file.type.includes('document') ||
                       file.type.includes('text');

    if (!isImage && !isDocument) {
      toast.error("Type de fichier non supporté. Utilisez des images ou des documents PDF/texte.");
      return;
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Content = reader.result as string;
        
        const userMessage: Message = { 
          role: "user", 
          content: isImage ? `📷 ${t.imageReceived}: ${file.name}` : `📄 ${t.documentReceived}: ${file.name}`,
          type: isImage ? "image" : "document",
          fileName: file.name,
          fileUrl: base64Content
        };
        
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        try {
          await streamChat(newMessages.filter(m => m.content !== t.welcome), {
            type: isImage ? 'image' : 'document',
            content: base64Content,
            name: file.name
          });
        } catch (error) {
          console.error("File chat error:", error);
          setMessages(prev => [...prev, { role: "assistant", content: "Désolé, je n'ai pas pu analyser ce fichier. Pouvez-vous me décrire son contenu ?" }]);
        }
      };
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Erreur lors du traitement du fichier");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const scrollToContact = () => {
    setIsOpen(false);
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />

      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 sm:bottom-6 ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-[99990] w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-bounce`}
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)',
          boxShadow: '0 8px 32px rgba(22, 101, 52, 0.4)',
        }}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-amber-400 rounded-full animate-ping" />
      </button>

      {isOpen && (
        <div
          className={`fixed z-[99995] flex flex-col overflow-hidden animate-scale-in
            inset-2 sm:inset-auto
            sm:bottom-20 md:bottom-24 
            ${isRTL ? 'sm:left-4' : 'sm:right-4'} 
            sm:w-[380px] sm:max-w-[calc(100vw-2rem)] 
            sm:h-[500px] md:h-[550px] sm:max-h-[75vh]
            rounded-2xl sm:rounded-2xl shadow-2xl`}
          style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{t.title}</h3>
                <p className="text-white/80 text-xs">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title={isTTSEnabled ? "Désactiver la voix" : "Activer la voix"}
              >
                {isTTSEnabled ? (
                  <Volume2 className="w-5 h-5 text-white" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/50" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? (isRTL ? "flex-row-reverse" : "flex-row") : isRTL ? "flex-row" : "flex-row"} gap-2`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-amber-400 to-amber-500"
                      : "bg-gradient-to-br from-green-600 to-green-700"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-amber-50 to-amber-100 text-gray-800"
                      : "bg-white shadow-sm border border-gray-100 text-gray-800"
                  }`}
                >
                  {msg.type === "image" && msg.fileUrl && (
                    <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full rounded-lg mb-2" />
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {(isLoading || isProcessingVoice) && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-500">
                    {isProcessingVoice ? t.processingVoice : "..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={t.attachFile}
                disabled={isLoading}
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors animate-pulse"
                  title={t.stopRecording}
                >
                  <StopCircle className="w-5 h-5 text-red-500" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title={t.voiceMessage}
                  disabled={isLoading}
                >
                  <Mic className="w-5 h-5 text-gray-500" />
                </button>
              )}

              {isPlayingAudio && (
                <button
                  onClick={stopAudio}
                  className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
                  title="Arrêter l'audio"
                >
                  <VolumeX className="w-5 h-5 text-green-600" />
                </button>
              )}
            </div>
            
            {isRecording && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-600">{t.recording}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={t.placeholder}
                disabled={isLoading || isRecording}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || isRecording}
                className="p-2.5 rounded-full transition-all disabled:opacity-50"
                style={{
                  background: input.trim() ? 'linear-gradient(135deg, #166534 0%, #14532d 100%)' : '#e5e7eb',
                }}
              >
                <Send className={`w-5 h-5 ${input.trim() ? "text-white" : "text-gray-400"}`} />
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={scrollToContact}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.contactTeam}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;