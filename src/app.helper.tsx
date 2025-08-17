import { marked } from './utils/marked';

export const renderContent = (markdown: string) => {
  const htmlContent = marked.parse(markdown, { async: false });

  // Parse the HTML to find ul/li elements and make them interactive
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const processListItems = (element: Element): React.ReactNode[] => {
    const items: React.ReactNode[] = [];

    element.querySelectorAll('li').forEach((li, index) => {
      const text = li.textContent || '';
      const dashIndex = text.indexOf(' - ');

      if (dashIndex > 0) {
        const buttonText = text.substring(0, dashIndex);
        const description = text.substring(dashIndex + 3);

        items.push(
          <li key={index}>
            <button className="btn btn-sm btn-outline mr-2" onClick={() => console.log(`Clicked: ${buttonText}`)}>
              {buttonText}
            </button>
            <span>{description}</span>
          </li>,
        );
      } else {
        items.push(<li key={index}>{text}</li>);
      }
    });

    return items;
  };

  // Check if content has lists
  const hasLists = doc.querySelectorAll('ul').length > 0;

  if (hasLists) {
    const elements: React.ReactNode[] = [];
    let elementIndex = 0;

    Array.from(doc.body.childNodes).forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        if (element.tagName === 'UL') {
          elements.push(
            <ul key={elementIndex++} className="ml-10 list-disc">
              {processListItems(element)}
            </ul>,
          );
        } else {
          elements.push(<div key={elementIndex++} dangerouslySetInnerHTML={{ __html: element.outerHTML }} />);
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        elements.push(<div key={elementIndex++}>{node.textContent}</div>);
      }
    });

    return <div>{elements}</div>;
  }

  // Fallback for non-list content
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};
