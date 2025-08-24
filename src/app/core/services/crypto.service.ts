import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }
  sortJsonKeys(data: Record<string, any>): string {
    const sortedObject = Object.keys(data)
      .sort() // Sort keys lexicographically
      .reduce((sorted, key) => {
        sorted[key] = data[key];
        return sorted;
      }, {} as Record<string, any>);
    return JSON.stringify(data); // Return stringified sorted JSON
  }

  // Generate HMAC-SHA256 and return Base64-encoded string
  async generateHmac(secretKey: string, data: any): Promise<string> {
    const sortedData = this.sortJsonKeys(data);

    const encoder = new TextEncoder();
    const key = encoder.encode(secretKey);
    const dataBuffer = encoder.encode(sortedData);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);

    // Convert signature to Base64
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
}
