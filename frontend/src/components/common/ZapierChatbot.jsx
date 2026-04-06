'use client';

import Script from 'next/script';

const CHATBOT_ID = 'cmnmwhyvh0018krzzlgqish8a';
const ZAPIER_SCRIPT_SRC = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';

export default function ZapierChatbot() {
    return (
        <>
            <Script src={ZAPIER_SCRIPT_SRC} strategy="afterInteractive" type="module" />

            <div className="fixed bottom-4 right-4 z-10000">
                <zapier-interfaces-chatbot-embed
                    is-popup="true"
                    chatbot-id={CHATBOT_ID}
                    style={{ display: 'block' }}
                />
            </div>
        </>
    );
}