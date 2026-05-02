export function decodeMimeHeader(text: string) {
    // Regex to find MIME encoded parts: =?charset?encoding?data?=
    return text.replace(/=\?([\w-]+)\?([QqBb])\?(.+?)\?=/g, (match, charset, encoding, data) => {
        if (encoding.toUpperCase() === 'Q') {
            // 1. Quoted-Printable: Replace '=' with '%' and '_' with ' ' (per RFC 2047)
            const portableData = data.replace(/=/g, '%').replace(/_/g, ' ');
            try {
                return decodeURIComponent(portableData);
            } catch (e) {
                return data; // Fallback
            }
        } else if (encoding.toUpperCase() === 'B') {
            // 2. Base64: Use atob and TextDecoder
            const binary = atob(data);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            return new TextDecoder(charset).decode(bytes);
        }
        return match;
    });
}