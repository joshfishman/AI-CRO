import fs from 'fs';
import path from 'path';
import { Marked } from 'marked';
import DocsLayout from '../../DocsLayout';

export default function WebflowIntegrationPage() {
  // Read the markdown file from the docs directory
  const filePath = path.join(process.cwd(), 'docs', 'webflow-integration.md');
  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading Webflow integration markdown file:', error);
    content = '# Error\nCould not load the Webflow integration documentation.';
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