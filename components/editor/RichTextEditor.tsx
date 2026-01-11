"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Heading2,
  Link,
  Image,
  Table,
  Type,
  Save,
  X,
  Sparkles,
} from "lucide-react";

interface RichTextEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  onImprove?: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
  onImprove,
}) => {
  const [content, setContent] = useState(initialContent);
  const [showHTML, setShowHTML] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Konversi HTML ke text yang mudah dibaca untuk edit
  const htmlToEditableText = (html: string): string => {
    return html
      .replace(/<div[^>]*>/g, "")
      .replace(/<\/div>/g, "\n")
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n\n")
      .replace(/<h1[^>]*>/g, "# ")
      .replace(/<\/h1>/g, "\n\n")
      .replace(/<h2[^>]*>/g, "## ")
      .replace(/<\/h2>/g, "\n\n")
      .replace(/<h3[^>]*>/g, "### ")
      .replace(/<\/h3>/g, "\n\n")
      .replace(/<strong[^>]*>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<b[^>]*>/g, "**")
      .replace(/<\/b>/g, "**")
      .replace(/<em[^>]*>/g, "*")
      .replace(/<\/em>/g, "*")
      .replace(/<i[^>]*>/g, "*")
      .replace(/<\/i>/g, "*")
      .replace(/<ul[^>]*>/g, "")
      .replace(/<\/ul>/g, "")
      .replace(/<li[^>]*>/g, "• ")
      .replace(/<\/li>/g, "\n")
      .replace(/<table[^>]*>/g, "\n--- TABLE ---\n")
      .replace(/<\/table>/g, "\n--- END TABLE ---\n")
      .replace(/<tr[^>]*>/g, "")
      .replace(/<\/tr>/g, "\n")
      .replace(/<td[^>]*>/g, "| ")
      .replace(/<\/td>/g, " ")
      .replace(/<th[^>]*>/g, "| **")
      .replace(/<\/th>/g, "** ")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
  };

  // Konversi text yang diedit kembali ke HTML
  const editableTextToHTML = (text: string): string => {
    return text
      .replace(
        /^# (.*$)/gm,
        '<h1 style="color: #1e40af; font-size: 24px; font-weight: 700; margin: 20px 0 15px 0;">$1</h1>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 style="color: #2563eb; font-size: 20px; font-weight: 600; margin: 15px 0 10px 0;">$1</h2>'
      )
      .replace(
        /^### (.*$)/gm,
        '<h3 style="color: #3b82f6; font-size: 18px; font-weight: 600; margin: 12px 0 8px 0;">$1</h3>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong style="font-weight: 700;">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      .replace(
        /^• (.*$)/gm,
        '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>'
      )
      .replace(
        /^-\s+(.*$)/gm,
        '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>'
      )
      .replace(
        /^\d+\.\s+(.*$)/gm,
        '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>'
      )
      .replace(/\n/g, "<br>")
      .replace(
        /<li[^>]*>.*?<\/li>/g,
        (match) =>
          `<ul style="margin: 10px 0; padding-left: 20px;">${match}</ul>`
      )
      .replace(
        /<ul[^>]*><ul[^>]*>/g,
        '<ul style="margin: 10px 0; padding-left: 20px;">'
      )
      .replace(/<\/ul><\/ul>/g, "</ul>")
      .replace(
        /Rp\s*([\d,.]+)/g,
        '<span style="background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Rp $1</span>'
      )
      .replace(
        /--- TABLE ---/g,
        '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; margin: 15px 0;">'
      )
      .replace(/--- END TABLE ---/g, "</table></div>")
      .replace(
        /\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g,
        (match, header1, header2, header3, header4) => {
          return `<tr style="background: #3b82f6;">
          <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">${header1}</th>
          <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">${header2}</th>
          <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">${header3}</th>
          <th style="padding: 12px; text-align: left; color: white; font-weight: 600;">${header4}</th>
        </tr>`;
        }
      )
      .replace(
        /\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g,
        (match, cell1, cell2, cell3, cell4) => {
          return `<tr style="background: #f8fafc;">
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${cell1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${cell2}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${cell3}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${cell4}</td>
        </tr>`;
        }
      );
  };

  useEffect(() => {
    // Konversi HTML awal ke format yang mudah diedit
    setContent(htmlToEditableText(initialContent));
  }, [initialContent]);

  const handleFormat = (format: string) => {
    const textarea = document.getElementById(
      "editor-textarea"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = "";

    switch (format) {
      case "bold":
        newText = `**${selectedText}**`;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        break;
      case "h1":
        newText = `# ${selectedText}`;
        break;
      case "h2":
        newText = `## ${selectedText}`;
        break;
      case "bullet":
        newText = `• ${selectedText}`;
        break;
      case "number":
        newText = `1. ${selectedText}`;
        break;
      case "table":
        newText = `\n--- TABLE ---\n| Day | Morning | Afternoon | Evening |\n| --- | --- | --- | --- |\n| Day 1 | Activity | Activity | Activity |\n--- END TABLE ---\n`;
        break;
      case "price":
        newText = `Rp ${selectedText}`;
        break;
      default:
        newText = selectedText;
    }

    const updatedContent =
      content.substring(0, start) + newText + content.substring(end);

    setContent(updatedContent);

    // Focus kembali ke textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length
      );
    }, 10);
  };

  const handleSave = () => {
    const htmlContent = editableTextToHTML(content);
    onSave(htmlContent);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => handleFormat("bold")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleFormat("italic")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4 text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          onClick={() => handleFormat("h1")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Heading 1"
        >
          <Heading className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleFormat("h2")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4 text-gray-700" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          onClick={() => handleFormat("bullet")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleFormat("number")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleFormat("table")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Insert Table"
        >
          <Table className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleFormat("price")}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Add Price Format"
        >
          <Type className="w-4 h-4 text-gray-700" />
        </button>
        <div className="flex-1"></div>
        <button
          onClick={() => setShowHTML(!showHTML)}
          className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showHTML ? "Hide HTML" : "Show HTML"}
        </button>
      </div>

      {/* Preview & Edit Area */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Edit Area */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Edit Content (Markdown Format):
          </label>
          <textarea
            id="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none font-mono text-sm"
            placeholder="Edit your itinerary here..."
            spellCheck="false"
          />
        </div>

        {/* Preview Area */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Live Preview:
          </label>
          <div className="flex-1 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-white">
            {showHTML ? (
              <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 p-3 rounded">
                {editableTextToHTML(content)}
              </pre>
            ) : (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: editableTextToHTML(content),
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Formatting Guide */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <details className="text-sm">
          <summary className="font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            📖 Formatting Guide
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="text-xs">
              <div className="font-semibold text-gray-600 mb-1">
                Text Format
              </div>
              <code className="bg-gray-100 px-2 py-1 rounded block mb-1">
                **bold**
              </code>
              <code className="bg-gray-100 px-2 py-1 rounded block">
                *italic*
              </code>
            </div>
            <div className="text-xs">
              <div className="font-semibold text-gray-600 mb-1">Headers</div>
              <code className="bg-gray-100 px-2 py-1 rounded block mb-1">
                # Heading 1
              </code>
              <code className="bg-gray-100 px-2 py-1 rounded block">
                ## Heading 2
              </code>
            </div>
            <div className="text-xs">
              <div className="font-semibold text-gray-600 mb-1">Lists</div>
              <code className="bg-gray-100 px-2 py-1 rounded block mb-1">
                • Bullet item
              </code>
              <code className="bg-gray-100 px-2 py-1 rounded block">
                1. Numbered
              </code>
            </div>
            <div className="text-xs">
              <div className="font-semibold text-gray-600 mb-1">Special</div>
              <code className="bg-gray-100 px-2 py-1 rounded block mb-1">
                Rp 100.000
              </code>
              <code className="bg-gray-100 px-2 py-1 rounded block">
                --- TABLE ---
              </code>
            </div>
          </div>
        </details>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between items-center p-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          {onImprove && (
            <button
              onClick={onImprove}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Improve with AI
            </button>
          )}

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
