'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Languages, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { graphqlRequest } from '@/lib/apollo-client';
import { LOG_ACTIVITY_MUTATION } from '@/lib/graphql/batch';

const LANGUAGE_OPTIONS = [
    { label: 'Hindi', value: 'hi-IN' }
];

const STORAGE_KEY = 'farmchain_voice_language';

function isRecordingSupported() {
    if (typeof window === 'undefined') {
        return false;
    }

    return Boolean(window.MediaRecorder && navigator?.mediaDevices?.getUserMedia);
}

function normalizeLanguage(language) {
    return String(language || 'en-US').trim() || 'en-US';
}

function getSourceLanguage(language) {
    return normalizeLanguage(language).split('-')[0] || 'en';
}

function extractQuantity(text) {
    const match = String(text || '').match(/\b(\d+(?:\.\d+)?)\b/);
    if (!match) {
        return null;
    }

    const quantity = Number(match[1]);
    return Number.isFinite(quantity) ? quantity : null;
}

function detectAction(text) {
    const normalized = String(text || '').toLowerCase();

    if (/\b(seed|seeding|sow|sowing|plant|planting)\b/.test(normalized)) return 'SEEDING';
    if (/\b(water|watering|irrigate|irrigation|sprinkle)\b/.test(normalized)) return 'WATERING';
    if (/\b(fertilizer|fertiliser|manure|compost|apply nutrients?|nutrients?)\b/.test(normalized)) return 'FERTILIZER';
    if (/\b(pesticide|spray|pest control|insecticide|fungicide|pest)\b/.test(normalized)) return 'PESTICIDE';
    if (/\b(harvest|harvesting|pick|picking|reap|cut)\b/.test(normalized)) return 'HARVEST';
    if (/\b(pack|packed|packing|package|packaged|bundle)\b/.test(normalized)) return 'PACKED';
    if (/\b(ship|shipped|shipping|dispatch|dispatched|send|sent|transport)\b/.test(normalized)) return 'SHIPPED';

    return '';
}

function buildTranslationUrl(text, sourceLanguage) {
    const params = new URLSearchParams({
        client: 'gtx',
        sl: sourceLanguage,
        tl: 'en',
        dt: 't',
        q: text
    });

    return `https://translate.googleapis.com/translate_a/single?${params.toString()}`;
}

export default function VoiceLogger({ batchId, onLogged }) {
    const browserRecognitionRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const liveTranscribeBusyRef = useRef(false);
    const liveTranscribeEnabledRef = useRef(false);
    const liveTranscriptBufferRef = useRef('');
    const transcriptRef = useRef('');
    const processedRef = useRef(false);
    const recordingTimeoutRef = useRef(null);
    const captureCountdownRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const audioFrameRef = useRef(null);
    const CAPTURE_WINDOW_SECONDS = 10;
    const MAX_RETRIES = 3;

    const [language, setLanguage] = useState('hi-IN');
    const [isSupported, setIsSupported] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [detectedSpeech, setDetectedSpeech] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [detectedActivity, setDetectedActivity] = useState('');
    const [listeningCountdown, setListeningCountdown] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [status, setStatus] = useState({ type: '', text: '' });
    const [logEntries, setLogEntries] = useState([
        {
            time: new Date().toLocaleTimeString(),
            label: 'Ready',
            detail: 'Tap Speak Activity to start logging by voice.',
            tone: 'neutral'
        }
    ]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }

        setIsSupported(isRecordingSupported());
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    useEffect(() => {
        return () => {
            if (captureCountdownRef.current) {
                window.clearInterval(captureCountdownRef.current);
            }
            if (audioFrameRef.current) {
                window.cancelAnimationFrame(audioFrameRef.current);
            }
            browserRecognitionRef.current?.stop?.();
            sourceNodeRef.current?.disconnect?.();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            const tracks = mediaStreamRef.current?.getTracks?.() || [];
            tracks.forEach((track) => track.stop());
        };
    }, []);

    const clearCaptureCountdown = () => {
        if (captureCountdownRef.current) {
            window.clearInterval(captureCountdownRef.current);
            captureCountdownRef.current = null;
        }
        setListeningCountdown(0);
    };

    const stopAudioMeter = () => {
        if (audioFrameRef.current) {
            window.cancelAnimationFrame(audioFrameRef.current);
            audioFrameRef.current = null;
        }

        sourceNodeRef.current?.disconnect?.();
        sourceNodeRef.current = null;
        analyserRef.current = null;

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        audioContextRef.current = null;
        setAudioLevel(0);
    };

    const startAudioMeter = (stream) => {
        if (!window.AudioContext && !window.webkitAudioContext) {
            return;
        }

        stopAudioMeter();

        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextCtor();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.85;

        const sourceNode = audioContext.createMediaStreamSource(stream);
        sourceNode.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceNodeRef.current = sourceNode;

        const sampleBuffer = new Uint8Array(analyser.frequencyBinCount);

        const sample = () => {
            if (!analyserRef.current) {
                return;
            }

            analyserRef.current.getByteTimeDomainData(sampleBuffer);

            let sumSquares = 0;
            for (let index = 0; index < sampleBuffer.length; index += 1) {
                const normalized = (sampleBuffer[index] - 128) / 128;
                sumSquares += normalized * normalized;
            }

            const rms = Math.sqrt(sumSquares / sampleBuffer.length);
            const scaledLevel = Math.min(100, Math.round(rms * 260));
            setAudioLevel(scaledLevel);

            audioFrameRef.current = window.requestAnimationFrame(sample);
        };

        audioFrameRef.current = window.requestAnimationFrame(sample);
    };

    const translateText = async (text) => {
        const trimmedText = String(text || '').trim();

        if (!trimmedText) {
            return trimmedText;
        }

        const response = await fetch('/api/translate-hi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: trimmedText })
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            throw new Error(payload?.message || 'Translation failed');
        }

        const payload = await response.json();
        const translated = String(payload?.translatedText || '').trim();

        return translated.trim() || trimmedText;
    };

    const logActivity = async (activityType, notes, translatedQuantity = null) => {
        if (!batchId) {
            throw new Error('Select a batch before logging activity.');
        }

        const input = {
            activityType,
            date: new Date().toISOString(),
            notes,
            quantity: translatedQuantity,
            isOrganic: false
        };

        const data = await graphqlRequest(LOG_ACTIVITY_MUTATION, {
            batchId,
            input
        });

        return data?.logActivity || null;
    };

    const transcribeRecordedAudio = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');
        formData.append('language', normalizeLanguage(language));

        const response = await fetch('/api/voice-transcribe', {
            method: 'POST',
            body: formData
        });

        const payload = await response.json();

        if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || 'Speech transcription failed.');
        }

        return String(payload?.transcript || '').trim();
    };

    const appendLiveTranscript = (partialText) => {
        const cleanedText = String(partialText || '').trim();
        if (!cleanedText) {
            return;
        }

        const currentText = liveTranscriptBufferRef.current.trim();
        const nextText = currentText ? `${currentText} ${cleanedText}` : cleanedText;
        liveTranscriptBufferRef.current = nextText;
        setDetectedSpeech(nextText);
    };

    const transcribeLiveChunk = async (chunkBlob) => {
        if (!liveTranscribeEnabledRef.current || liveTranscribeBusyRef.current) {
            return;
        }

        if (!chunkBlob || chunkBlob.size < 5000) {
            return;
        }

        liveTranscribeBusyRef.current = true;
        try {
            const partialTranscript = await transcribeRecordedAudio(chunkBlob);
            appendLiveTranscript(partialTranscript);
        } catch {
            // Ignore live chunk errors and keep final full-audio transcription as source of truth.
        } finally {
            liveTranscribeBusyRef.current = false;
        }
    };

    const getSpeechRecognitionCtor = () => {
        if (typeof window === 'undefined') {
            return null;
        }

        return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    };

    const startBrowserLiveTranscript = () => {
        const SpeechRecognition = getSpeechRecognitionCtor();
        if (!SpeechRecognition) {
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            browserRecognitionRef.current = recognition;

            recognition.lang = normalizeLanguage(language);
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const partial = Array.from(event.results)
                    .map((result) => result[0]?.transcript || '')
                    .join(' ')
                    .trim();

                if (partial) {
                    transcriptRef.current = partial;
                    setDetectedSpeech(partial);
                }
            };

            recognition.onerror = () => {
                // Non-fatal fallback. Keep audio recording/transcription path active.
            };

            recognition.start();
        } catch {
            // Ignore start failures; this is only a best-effort live fallback.
        }
    };

    const stopBrowserLiveTranscript = () => {
        try {
            browserRecognitionRef.current?.stop?.();
        } catch {
            // no-op
        }
        browserRecognitionRef.current = null;
    };

    const stopListening = () => {
        if (recordingTimeoutRef.current) {
            window.clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        stopBrowserLiveTranscript();
        stopAudioMeter();
    };

    const addLogEntry = (label, detail, tone = 'neutral') => {
        setLogEntries((previousEntries) => [
            {
                time: new Date().toLocaleTimeString(),
                label,
                detail,
                tone
            },
            ...previousEntries
        ].slice(0, 6));
    };

    const processTranscript = async (rawTranscript) => {
        const trimmedTranscript = String(rawTranscript || '').trim();

        if (!trimmedTranscript) {
            setStatus({ type: 'error', text: 'No speech detected. Try again.' });
            addLogEntry('Speech', 'No speech detected during the recording.', 'error');
            return;
        }

        if (!batchId) {
            setStatus({ type: 'error', text: 'Select a batch before logging.' });
            addLogEntry('Batch', 'No batch selected for voice logging.', 'error');
            return;
        }

        setIsProcessing(true);
        setStatus({ type: '', text: '' });

        try {
            const englishText = await translateText(trimmedTranscript);
            addLogEntry('Transcript', trimmedTranscript, 'neutral');
            addLogEntry('Translation', englishText, 'neutral');
            const activityType = detectAction(englishText);

            if (!activityType) {
                throw new Error('Could not detect a farming activity from the speech.');
            }

            setDetectedSpeech(trimmedTranscript);
            setTranslatedText(englishText);
            setDetectedActivity(activityType);
            addLogEntry('Detected', activityType, 'success');

            const quantity = extractQuantity(englishText);
            const loggedBatch = await logActivity(activityType, englishText, quantity);

            setStatus({
                type: 'success',
                text: `Logged ${activityType.toLowerCase()} successfully.`
            });
            addLogEntry('Logged', `Saved ${activityType.toLowerCase()} to the batch activity timeline.`, 'success');

            onLogged?.(loggedBatch);
        } catch (error) {
            setStatus({
                type: 'error',
                text: error?.message || 'Failed to log activity.'
            });
            addLogEntry('Error', error?.message || 'Failed to log activity.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const startListening = async () => {
        if (isListening) {
            stopListening();
            return;
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
            setStatus({
                type: 'error',
                text: 'Microphone recording is not supported in this browser.'
            });
            addLogEntry('Browser', 'Microphone recording is not supported in this browser.', 'error');
            return;
        }

        if (!window.MediaRecorder) {
            setStatus({
                type: 'error',
                text: 'Audio recording is not supported in this browser.'
            });
            addLogEntry('Browser', 'Audio recording is not supported in this browser.', 'error');
            return;
        }

        processedRef.current = false;
        transcriptRef.current = '';
        audioChunksRef.current = [];
        liveTranscriptBufferRef.current = '';
        liveTranscribeEnabledRef.current = true;
        setDetectedSpeech('');
        setTranslatedText('');
        setDetectedActivity('');
        clearCaptureCountdown();
        setListeningCountdown(CAPTURE_WINDOW_SECONDS);
        setStatus({ type: '', text: '' });
        addLogEntry('Listening', `Recording speech in ${selectedLanguageLabel}.`, 'neutral');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            startAudioMeter(stream);
            startBrowserLiveTranscript();

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;

            setIsListening(true);

            captureCountdownRef.current = window.setInterval(() => {
                setListeningCountdown((currentValue) => {
                    if (currentValue <= 1) {
                        if (captureCountdownRef.current) {
                            window.clearInterval(captureCountdownRef.current);
                            captureCountdownRef.current = null;
                        }
                        return 0;
                    }

                    return currentValue - 1;
                });
            }, 1000);

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    void transcribeLiveChunk(event.data);
                }
            };

            recorder.onerror = (event) => {
                setIsListening(false);
                clearCaptureCountdown();
                stopAudioMeter();
                stopBrowserLiveTranscript();
                liveTranscribeEnabledRef.current = false;
                setStatus({
                    type: 'error',
                    text: event?.error?.message || 'Voice recording failed.'
                });
                addLogEntry('Error', event?.error?.message || 'Voice recording failed.', 'error');
            };

            recorder.onstop = async () => {
                setIsListening(false);
                clearCaptureCountdown();
                stopAudioMeter();
                stopBrowserLiveTranscript();
                liveTranscribeEnabledRef.current = false;

                const tracks = mediaStreamRef.current?.getTracks?.() || [];
                tracks.forEach((track) => track.stop());
                mediaStreamRef.current = null;
                mediaRecorderRef.current = null;

                const recordedBlob = new Blob(audioChunksRef.current, { type: mimeType });
                audioChunksRef.current = [];

                if (!recordedBlob.size) {
                    setStatus({
                        type: 'error',
                        text: 'No audio was captured. Please try again and speak after the button starts recording.'
                    });
                    addLogEntry('Speech', 'No audio was captured.', 'error');
                    return;
                }

                setIsProcessing(true);

                try {
                    const transcript = await transcribeRecordedAudio(recordedBlob);

                    if (!transcript) {
                        throw new Error('No speech detected in the recording. Please speak after the recording starts.');
                    }

                    transcriptRef.current = transcript;
                    setDetectedSpeech(transcript);
                    addLogEntry('Transcript', transcript, 'neutral');
                    await processTranscript(transcript);
                } catch (error) {
                    const fallbackTranscript = transcriptRef.current.trim() || liveTranscriptBufferRef.current.trim();

                    if (fallbackTranscript) {
                        setDetectedSpeech(fallbackTranscript);
                        addLogEntry('Fallback', 'Using browser live transcript because API transcription failed.', 'neutral');
                        await processTranscript(fallbackTranscript);
                        setStatus({
                            type: 'success',
                            text: 'Logged activity using browser live transcript fallback.'
                        });
                    } else {
                        setStatus({
                            type: 'error',
                            text: error?.message || 'Speech transcription failed.'
                        });
                        addLogEntry('Error', error?.message || 'Speech transcription failed.', 'error');
                    }
                } finally {
                    setIsProcessing(false);
                }
            };

            recorder.start(2500);

            recordingTimeoutRef.current = window.setTimeout(() => {
                stopListening();
            }, CAPTURE_WINDOW_SECONDS * 1000);
        } catch (error) {
            setIsListening(false);
            clearCaptureCountdown();
            stopAudioMeter();
            stopBrowserLiveTranscript();
            setStatus({
                type: 'error',
                text: error?.message || 'Could not access the microphone.'
            });
            addLogEntry('Microphone', error?.message || 'Could not access the microphone.', 'error');
        }
    };

    const selectedLanguageLabel = LANGUAGE_OPTIONS.find((option) => option.value === language)?.label || 'English';

    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Voice-to-Activity Logging</p>
                    <h4 className="mt-1 text-lg font-bold text-slate-900">Speak in your local language</h4>
                    <p className="mt-1 text-sm text-slate-500">
                        Detect speech, translate it to English, and log it directly to the batch activity timeline.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={startListening}
                    disabled={!isSupported || isProcessing}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                        isListening
                            ? 'bg-red-600 text-white hover:bg-red-500'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isListening ? (
                        <MicOff className="h-4 w-4" />
                    ) : (
                        <Mic className="h-4 w-4" />
                    )}
                    {isListening ? 'Stop Recording' : '🎤 Speak Activity'}
                </button>
            </div>

            {isListening && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span>Recording, speak now</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                            {listeningCountdown > 0 ? `${listeningCountdown}s` : 'Live'}
                        </span>
                    </div>
                    <div>
                        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-emerald-700">
                            <span>Audio Input Level</span>
                            <span>{audioLevel}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-emerald-400 via-teal-500 to-green-600 transition-[width] duration-75"
                                style={{ width: `${Math.max(audioLevel, 2)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                    <Languages className="h-4 w-4 text-emerald-600" />
                    <span className="sr-only">Select language</span>
                    <select
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                        aria-label="Select voice input language"
                    >
                        {LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.value})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    Default: <span className="font-semibold text-slate-900">Hindi</span> · Current: <span className="font-semibold text-slate-900">{selectedLanguageLabel}</span>
                </div>
            </div>

            {!isSupported && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Your browser does not support the Web Speech API.</span>
                </div>
            )}

            {status.text && (
                <div
                    className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                        status.type === 'success'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border border-red-200 bg-red-50 text-red-700'
                    }`}
                >
                    {status.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{status.text}</span>
                </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected Speech</p>
                    <p className="mt-2 text-sm text-slate-800">{detectedSpeech || 'Waiting for voice input...'}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Translated Text</p>
                    <p className="mt-2 text-sm text-slate-800">{translatedText || 'Will appear after translation...'}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected Activity</p>
                    <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        {detectedActivity || 'No activity yet'}
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Voice Logs</p>
                        <p className="text-sm text-slate-500">Live steps from speech capture to activity logging.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {logEntries.length} entries
                    </span>
                </div>

                <div className="mt-4 max-h-56 space-y-3 overflow-y-auto pr-1">
                    {logEntries.map((entry, index) => (
                        <div
                            key={`${entry.time}-${index}`}
                            className={`rounded-2xl border px-3 py-2 text-sm ${
                                entry.tone === 'success'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                    : entry.tone === 'error'
                                        ? 'border-red-200 bg-red-50 text-red-700'
                                        : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide">
                                <span>{entry.label}</span>
                                <span>{entry.time}</span>
                            </div>
                            <p className="mt-1 text-sm normal-case font-normal leading-5">
                                {entry.detail}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                <Sparkles className="mb-2 h-4 w-4 text-emerald-600" />
                Speak something like “harvest the tomatoes”, “water the field”, or “spray pesticide”. The component will translate the speech, detect the action, and log it through the existing GraphQL mutation.
            </div>
        </div>
    );
}