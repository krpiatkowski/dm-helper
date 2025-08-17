import { marked as m } from 'marked';

export const marked = m.use({
  breaks: true,
  gfm: true,
});
