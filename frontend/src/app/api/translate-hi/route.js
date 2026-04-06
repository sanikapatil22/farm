import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function buildTranslateUrl(text) {
    const params = new URLSearchParams({
        client: 'gtx',
        sl: 'hi',
        tl: 'en',
        dt: 't',
        q: text
    });

    return `https://translate.googleapis.com/translate_a/single?${params.toString()}`;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const inputText = String(body?.text || '').trim();

        if (!inputText) {
            return NextResponse.json(
                { success: false, message: 'Text is required for translation.' },
                { status: 400 }
            );
        }

        const response = await fetch(buildTranslateUrl(inputText), {
            method: 'GET'
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: 'Translation provider request failed.' },
                { status: response.status }
            );
        }

        const payload = await response.json();
        const translatedText = Array.isArray(payload?.[0])
            ? payload[0].map((segment) => segment?.[0]).filter(Boolean).join('')
            : '';

        if (!translatedText) {
            return NextResponse.json(
                { success: false, message: 'Translation response was empty.' },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            translatedText
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error?.message || 'Translation failed.'
            },
            { status: 500 }
        );
    }
}