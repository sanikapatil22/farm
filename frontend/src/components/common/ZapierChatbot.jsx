'use client';

import Script from 'next/script';
import { MessageCircleMore } from 'lucide-react';

const CHATBOT_ID = 'cmnmwhyvh0018krzzlgqish8a';
const ZAPIER_SCRIPT_SRC = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';

export default function ZapierChatbot() {
    return (
        <>
            <Script src={ZAPIER_SCRIPT_SRC} strategy="afterInteractive" type="module" />

            <div className="fixed bottom-5 right-5 z-9999 flex flex-col items-end gap-3 pointer-events-none">
                <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-md">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
                        <MessageCircleMore className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold tracking-wide text-slate-800">Ask chat</span>
                </div>

                <div className="pointer-events-auto">
                    <zapier-interfaces-chatbot-embed
                        is-popup="true"
                        chatbot-id={CHATBOT_ID}
                    />
                </div>
            </div>
        </>
    );
}