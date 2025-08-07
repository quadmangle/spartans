export default {
  async fetch(request, env) {
    const auth = request.headers.get('Authorization') || '';
    const match = auth.match(/^Bearer ([^.]+)\.([^.]+)$/);
    if (!match) {
      console.warn('Unauthorized request: missing or malformed token');
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      const tokenIv = new Uint8Array(base64ToArrayBuffer(match[1]));
      const tokenCipher = new Uint8Array(base64ToArrayBuffer(match[2]));
      const key = await crypto.subtle.importKey(
        'raw',
        base64ToArrayBuffer(env.AES_KEY),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      const decoder = new TextDecoder();
      const tokenBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: tokenIv }, key, tokenCipher);
      const tokenData = JSON.parse(decoder.decode(tokenBuf));
      if (tokenData.exp <= Date.now()) {
        console.warn('Unauthorized request: expired token');
        return new Response('Unauthorized', { status: 401 });
      }

      const body = await request.json();
      const payloadIv = new Uint8Array(body.iv);
      const payloadCipher = new Uint8Array(base64ToArrayBuffer(body.payload));
      const decryptedBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: payloadIv }, key, payloadCipher);
      const payload = JSON.parse(decoder.decode(decryptedBuf));

      return new Response(JSON.stringify({ received: payload }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('Unauthorized request: invalid token or payload', err);
      return new Response('Unauthorized', { status: 401 });
    }
  }
};

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
