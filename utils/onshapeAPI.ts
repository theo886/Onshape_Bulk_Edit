import type { OnshapeConfig } from '../types';

/**
 * Creates an HMAC-SHA256 signature required for Onshape API authentication.
 * @param message The string to sign.
 * @param secretKey The user's Onshape secret key.
 * @returns A promise that resolves to the signature as an ArrayBuffer.
 */
async function createHmacSha256Signature(message: string, secretKey: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    return window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
}

/**
 * Makes an authenticated request to the Onshape API.
 * This function constructs the required headers, including a unique nonce and
 * an HMAC-SHA256 signature, before making the fetch request.
 *
 * @param url The full URL for the API endpoint.
 * @param method The HTTP method ('GET' or 'POST').
 * @param config The user's Onshape API configuration (access and secret keys).
 * @param body Optional request body for 'POST' requests.
 * @returns A promise that resolves to the JSON response from the API.
 */
export const onshapeFetch = async (
    url: string,
    method: 'GET' | 'POST',
    config: OnshapeConfig,
    body?: Record<string, any>
): Promise<any> => {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const queryParams = urlObj.search.substring(1);

    const nonce = Math.random().toString(36).substring(2, 17) + Date.now();
    const date = new Date().toUTCString();
    const contentType = 'application/json';

    const stringToSign = [
        method,
        nonce,
        date,
        contentType,
        path,
        queryParams,
        ''
    ].map(v => (v || '').toLowerCase()).join('\n');

    const signatureBuffer = await createHmacSha256Signature(stringToSign, config.secretKey);
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const headers: HeadersInit = {
        'Accept': 'application/vnd.onshape.v1+json;charset=UTF-8;qs=0.1',
        'Content-Type': contentType,
        'On-Nonce': nonce,
        'Date': date,
        'Authorization': `On ${config.accessKey}:HmacSHA256:${signature}`
    };

    const fetchOptions: RequestInit = {
        method,
        headers,
    };
    
    if (body) {
        fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch(e) {
            errorBody = await response.text();
        }
        console.error("Onshape API Error Response:", errorBody);
        throw new Error(`Onshape API request failed: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) { // No Content
        return null;
    }

    return response.json();
};
