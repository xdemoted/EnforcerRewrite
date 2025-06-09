import fetch from 'node-fetch';

export default class ImageURLVerify {
  private static contentTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "video/mp4"];

  static async verify(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      return "Invalid URL";
    }

    const contentType = response.headers.get('content-type');

    if (!contentType || !this.contentTypes.includes(contentType)) {
      return "Invalid Content Type";
    }

    return true;
  }
}