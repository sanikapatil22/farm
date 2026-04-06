import { NextResponse } from 'next/server';

const DEFAULT_MODEL = 'openai/whisper-large-v3-turbo';

export const runtime = 'nodejs';

function getHuggingFaceToken() {
    return process.env.HUGGINGFACE_API_TOKEN || process.env.HF_TOKEN || '';
}

function getModelName() {
    return process.env.HUGGINGFACE_ASR_MODEL || DEFAULT_MODEL;
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio');
        const language = String(formData.get('language') || '').trim();

        if (!audioFile || typeof audioFile.arrayBuffer !== 'function') {
            return NextResponse.json(
                { success: false, message: 'Missing audio file.' },
                { status: 400 }
            );
        }

        const model = getModelName();
        const token = getHuggingFaceToken();
        const audioArrayBuffer = await audioFile.arrayBuffer();

        const response = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': audioFile.type || 'audio/webm',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: audioArrayBuffer
        });

        const responseText = await response.text();
        let payload = null;

        try {
            payload = responseText ? JSON.parse(responseText) : null;
        } catch {
            payload = { text: responseText };
        }

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: payload?.error || payload?.message || 'Speech transcription failed.',
                    details: payload,
                    model,
                    language: language || null
                },
                { status: response.status }
            );
        }

        const transcript = String(
            payload?.text || payload?.transcription || payload?.result || ''
        ).trim();

        if (!transcript) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No transcript was returned by the transcription service.',
                    details: payload,
                    model,
                    language: language || null
                },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            transcript,
            model,
            language: language || null
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error?.message || 'Transcription proxy failed.',
                details: error?.stack || null
            },
            { status: 500 }
        );
    }
}