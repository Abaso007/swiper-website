declare namespace Cloudflare {
  interface Env {
    BEEHIIV_API_KEY?: string;
    BEEHIIV_PUBLICATION_ID?: string;
    SUBSCRIBE_RATELIMIT?: {
      limit: (options: { key: string }) => Promise<{ success: boolean }>;
    };
  }
}
