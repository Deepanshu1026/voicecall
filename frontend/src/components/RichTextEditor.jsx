import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiBold, FiItalic, FiCode, FiLink, FiImage, FiList, FiType,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiRotateCcw, FiRotateCw, FiChevronDown, FiVideo, FiMinus,
} from 'react-icons/fi';
import { FaStrikethrough, FaHighlighter, FaUnderline } from 'react-icons/fa';
import '../styles/richTextEditor.css';

const BLOCK_OPTIONS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Quote', value: 'blockquote' },
  { label: 'Code Block', value: 'pre' },
];

const SIZE_OPTIONS = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '5' },
  { label: 'Huge', value: '6' },
];

const RichTextEditor = ({ value = '', onChange, placeholder = 'Write your blog content here...' }) => {
  const editorRef = useRef(null);
  const savedRange = useRef(null);
  const lastHtml = useRef(value);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastHtml.current) {
      el.innerHTML = value || '';
      lastHtml.current = value || '';
    }
  }, [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (el && !el.innerHTML && value) {
      el.innerHTML = value;
      lastHtml.current = value;
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === '<br>' ? '' : el.innerHTML;
    lastHtml.current = html;
    if (onChange) onChange(html);
  }, [onChange]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }, []);

  const exec = useCallback((command, arg = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    emitChange();
    forceUpdate((n) => n + 1);
  }, [emitChange, restoreSelection]);

  const applyBlock = (tag) => {
    exec('formatBlock', `<${tag}>`);
  };

  const insertInlineCode = () => {
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    const text = sel ? sel.toString() : '';
    if (text) {
      document.execCommand('insertHTML', false, `<code>${text}</code>&nbsp;`);
      emitChange();
      forceUpdate((n) => n + 1);
    }
  };

  const insertLink = () => {
    restoreSelection();
    const url = window.prompt('Enter the link URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    restoreSelection();
    const url = window.prompt('Enter the image URL:', 'https://');
    if (url) exec('insertImage', url);
  };

  const insertVideo = () => {
    restoreSelection();
    const url = window.prompt('Enter the video embed URL (YouTube/Vimeo):', 'https://');
    if (!url) return;
    const html = `<div class="rte-embed"><iframe src="${url}" frameborder="0" allowfullscreen></iframe></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    emitChange();
    forceUpdate((n) => n + 1);
  };

  const active = (command) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  const currentBlock = () => {
    try { return (document.queryCommandValue('formatBlock') || 'p').toLowerCase(); } catch { return 'p'; }
  };

  const ToolBtn = ({ title, onClick, isActive, children }) => (
    <button
      type="button"
      className={`rte-btn ${isActive ? 'active' : ''}`}
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="rte-divider" />;

  return (
    <div className="rte-wrapper">
      <div className="rte-toolbar">
        <div className="rte-group">
          <ToolBtn title="Undo" onClick={() => exec('undo')}><FiRotateCcw /></ToolBtn>
          <ToolBtn title="Redo" onClick={() => exec('redo')}><FiRotateCw /></ToolBtn>
        </div>

        <Divider />

        <div className="rte-group">
          <div className="rte-select-wrap">
            <select
              className="rte-select"
              value=""
              title="Text style"
              onMouseDown={saveSelection}
              onChange={(e) => { if (e.target.value) applyBlock(e.target.value); e.target.value = ''; }}
            >
              <option value="">Style</option>
              {BLOCK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown className="rte-select-caret" />
          </div>
          <div className="rte-select-wrap">
            <select
              className="rte-select"
              value=""
              title="Font size"
              onMouseDown={saveSelection}
              onChange={(e) => { if (e.target.value) exec('fontSize', e.target.value); e.target.value = ''; }}
            >
              <option value="">Size</option>
              {SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown className="rte-select-caret" />
          </div>
        </div>

        <Divider />

        <div className="rte-group">
          <ToolBtn title="Bold" isActive={active('bold')} onClick={() => exec('bold')}><FiBold /></ToolBtn>
          <ToolBtn title="Italic" isActive={active('italic')} onClick={() => exec('italic')}><FiItalic /></ToolBtn>
          <ToolBtn title="Underline" isActive={active('underline')} onClick={() => exec('underline')}><FaUnderline /></ToolBtn>
          <ToolBtn title="Strikethrough" isActive={active('strikeThrough')} onClick={() => exec('strikeThrough')}><FaStrikethrough /></ToolBtn>
          <ToolBtn title="Inline code" onClick={insertInlineCode}><FiCode /></ToolBtn>
        </div>

        <Divider />

        <div className="rte-group">
          <label className="rte-btn rte-color" title="Text color">
            <FiType />
            <span className="rte-color-bar" style={{ background: 'currentColor' }} />
            <input
              type="color"
              defaultValue="#1a202c"
              onMouseDown={saveSelection}
              onChange={(e) => exec('foreColor', e.target.value)}
            />
          </label>
          <label className="rte-btn rte-color" title="Highlight color">
            <FaHighlighter />
            <span className="rte-color-bar" style={{ background: '#fde047' }} />
            <input
              type="color"
              defaultValue="#fde047"
              onMouseDown={saveSelection}
              onChange={(e) => exec('hiliteColor', e.target.value)}
            />
          </label>
        </div>

        <Divider />

        <div className="rte-group">
          <ToolBtn title="Insert link" onClick={insertLink}><FiLink /></ToolBtn>
          <ToolBtn title="Insert image" onClick={insertImage}><FiImage /></ToolBtn>
          <ToolBtn title="Insert video" onClick={insertVideo}><FiVideo /></ToolBtn>
          <ToolBtn title="Horizontal line" onClick={() => exec('insertHorizontalRule')}><FiMinus /></ToolBtn>
        </div>

        <Divider />

        <div className="rte-group">
          <ToolBtn title="Bullet list" isActive={active('insertUnorderedList')} onClick={() => exec('insertUnorderedList')}><FiList /></ToolBtn>
          <ToolBtn title="Numbered list" isActive={active('insertOrderedList')} onClick={() => exec('insertOrderedList')}>
            <span className="rte-ol">1.</span>
          </ToolBtn>
          <ToolBtn title="Align left" isActive={active('justifyLeft')} onClick={() => exec('justifyLeft')}><FiAlignLeft /></ToolBtn>
          <ToolBtn title="Align center" isActive={active('justifyCenter')} onClick={() => exec('justifyCenter')}><FiAlignCenter /></ToolBtn>
          <ToolBtn title="Align right" isActive={active('justifyRight')} onClick={() => exec('justifyRight')}><FiAlignRight /></ToolBtn>
          <ToolBtn title="Justify" isActive={active('justifyFull')} onClick={() => exec('justifyFull')}><FiAlignJustify /></ToolBtn>
        </div>

        <Divider />

        <div className="rte-group">
          <ToolBtn title="Clear formatting" onClick={() => exec('removeFormat')}><FiType /></ToolBtn>
        </div>
      </div>

      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={saveSelection}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
      />
    </div>
  );
};

export default RichTextEditor;
