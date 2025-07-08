export interface StaticPage {
  name: 'about' | 'contact' | 'features';
  content: string;
  last_updated: string | Date;
}