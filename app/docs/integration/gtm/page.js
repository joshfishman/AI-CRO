import fs from 'fs';
import path from 'path';
import { Marked } from 'marked';
import DocsLayout from '../../DocsLayout';

export default function GTMIntegrationPage() {
  // Read the markdown file from the docs directory
  const filePath = path.join(process.cwd(), 'docs', 'gtm-integration.md');
  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading GTM integration markdown file:', error);
    content = '# Error\nCould not load the GTM integration documentation.';
  }

  // Parse markdown to HTML
  const marked = new Marked();
  const htmlContent = marked.parse(content);

  return (
    <DocsLayout>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </DocsLayout>
  );
} 