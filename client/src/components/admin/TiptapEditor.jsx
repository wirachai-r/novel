"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// MenuBar
function MenuBar({ editor }) {
  const [active, setActive] = React.useState({});

  useEffect(() => {
    if (!editor) return;

    const updateActive = () => {
      setActive({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        strike: editor.isActive("strike"),
        heading1: editor.isActive("heading", { level: 1 }),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
        codeBlock: editor.isActive("codeBlock"),
      });
    };

    editor.on("selectionUpdate", updateActive);
    editor.on("update", updateActive);

    return () => {
      editor.off("selectionUpdate", updateActive);
      editor.off("update", updateActive);
    };
  }, [editor]);

  if (!editor) return null;

  const buttonClass = (isActive) =>
    `px-2 py-1 border rounded ${isActive ? "bg-blue-500 text-white" : "bg-white text-black"} hover:bg-blue-100`;

  return (
    <div className="tiptap-menubar mb-2 flex flex-wrap gap-2">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(active.bold)}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(active.italic)}>I</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClass(active.strike)}>S</button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()} className={buttonClass(false)}>↵</button>
      <button onClick={() => editor.chain().focus().undo().run()} className={buttonClass(false)}>Undo</button>
      <button onClick={() => editor.chain().focus().redo().run()} className={buttonClass(false)}>Redo</button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()} className={buttonClass(false)}>Clear</button>
    </div>
  );
}

// Controlled TiptapEditor
const TiptapEditor = ({ value = "", onChange, className }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getHTML());
    },
  });

  // Sync content ถ้า value เปลี่ยน
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className={`tiptap-editor}`}>
      <MenuBar editor={editor} />
      <div className="border rounded-lg p-4 min-h-[300px]">
        <EditorContent editor={editor} placeholder="Chapter content"/>
      </div>
    </div>
  );
};

export default TiptapEditor;
