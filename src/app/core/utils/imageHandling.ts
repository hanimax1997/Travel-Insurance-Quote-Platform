import { HttpClient } from "@angular/common/http";

export default function getBase64ImageFromURL(http:HttpClient,url: string): Promise<string> {
    return http.get(url, { responseType: 'blob' }).toPromise().then(blob => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        if(blob)
        reader.readAsDataURL(blob);
      });
    });
  }