import {FaBold} from "react-icons/fa";
import {FaItalic, FaStrikethrough, FaHighlighter} from "react-icons/fa6";
import classNames from "classnames";
import {useState, useEffect} from "react";
import {Workspace} from "obsidian";

interface IToolbarProps {
   workspace: Workspace;
}

type FormattingType = "bold" | "italic" | "strikeout" | "highlight";

const Toolbar = (props: IToolbarProps) => {
   const {workspace} = props;
   const [active, setActive] = useState({
      bold: false,
      italic: false,
      strikeout: false,
      highlight: false,
   });

   // Helper function to check if text contains formatting
   const hasFormatting = (text: string, type: string): boolean => {
      switch (type) {
         case "bold":
            // Check if the text is entirely wrapped in bold markers
            return (
               /^(\*\*|__)(.*?)(\*\*|__)$/.test(text) ||
               // Also check if text is inside a complex nested structure
               (text.includes("**") && text.match(/\*\*/g)?.length === 2)
            );
         case "italic":
            // Detect nested italic structures
            return (
               /[_*].*[_*]/.test(text) &&
               // Ensure meaningful italic formatting
               text.match(/[_*]/g)?.length === 2 &&
               // Exclude bold-like structures
               !/\*\*/.test(text)
            );
         case "strikeout":
            // Check for strikeout in normal and nested contexts
            return /^~~(.*?)~~$/.test(text) || (text.includes("~~") && text.match(/~~/g)?.length === 2);
         case "highlight":
            // Check for highlight in normal and nested contexts
            return /^==(.*?)==$/.test(text) || (text.includes("==") && text.match(/==/g)?.length === 2);
         default:
            return false;
      }
   };

   // Function to handle adding or removing formatting from complex structures
   const modifyFormatting = (text: string, type: string, shouldRemove: boolean): string => {
      if (shouldRemove) {
         switch (type) {
            case "bold":
               // Remove bold formatting preserving other formats
               return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1");
            case "italic":
               // Remove italic formatting preserving other formats
               return text.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "$1").replace(/(?<!_)_(?!_)(.*?)_(?!_)/g, "$1");
            case "strikeout":
               // Remove strikeout formatting preserving other formats
               return text.replace(/~~(.*?)~~/g, "$1");
            case "highlight":
               // Remove highlight formatting preserving other formats
               return text.replace(/==(.*?)==/g, "$1");
            default:
               return text;
         }
      } else {
         // Add formatting while preserving existing nested structures
         switch (type) {
            case "bold":
               return `**${text}**`;
            case "italic":
               return `_${text}_`;
            case "strikeout":
               return `~~${text}~~`;
            case "highlight":
               return `==${text}==`;
            default:
               return text;
         }
      }
   };

   // Function to calculate the length difference after formatting changes
   const calculateLengthDifference = (type: string, isRemoving: boolean): number => {
      switch (type) {
         case "bold":
            return isRemoving ? -4 : 4; // ** at start and end = 4 chars
         case "italic":
            return isRemoving ? -2 : 2; // _ at start and end = 2 chars
         case "strikeout":
            return isRemoving ? -4 : 4; // ~~ at start and end = 4 chars
         case "highlight":
            return isRemoving ? -4 : 4; // == at start and end = 4 chars
         default:
            return 0;
      }
   };

   useEffect(() => {
      const checkSelection = () => {
         const activeEditor = workspace.activeEditor?.editor;
         if (!activeEditor) return;

         const selection = activeEditor.getSelection();

         // Check each formatting type
         setActive({
            bold: hasFormatting(selection, "bold"),
            italic: hasFormatting(selection, "italic"),
            strikeout: hasFormatting(selection, "strikeout"),
            highlight: hasFormatting(selection, "highlight"),
         });
      };

      // Add event listener for selection changes
      document.addEventListener("selectionchange", checkSelection);

      return () => {
         document.removeEventListener("selectionchange", checkSelection);
      };
   }, [workspace.activeEditor]);

   const onSelect = (type: FormattingType) => {
      const activeEditor = workspace.activeEditor?.editor;
      if (!activeEditor) return;

      // Focus the editor to ensure we're working with it
      activeEditor.focus();

      // Get current selection
      const selection = activeEditor.getSelection();
      if (!selection) return;

      // Store the current selection range
      const from = activeEditor.getCursor("from");
      const to = activeEditor.getCursor("to");

      // Check if the selection already has this formatting
      const hasFormat = hasFormatting(selection, type);

      // Modify the text by either adding or removing the formatting
      const newText = modifyFormatting(selection, type, hasFormat);

      // Calculate formatting characters length difference
      const lengthDiff = calculateLengthDifference(type, hasFormat);

      // Replace the selection with the new text
      activeEditor.replaceRange(newText, from, to);

      // Calculate new selection coordinates
      const newSelectionStart = from;
      const newSelectionEnd = {
         line: to.line,
         ch: to.ch + lengthDiff,
      };

      // Adjust for multi-line selections
      if (from.line !== to.line) {
         newSelectionEnd.ch = activeEditor.getLine(to.line).length;
      }

      // Re-select the text with the new formatting
      setTimeout(() => {
         activeEditor.setSelection(newSelectionStart, newSelectionEnd);
         activeEditor.focus();
      }, 10);
   };

   return (
      <div className="toolbar-container">
         <span
            className={classNames("toolbar-icon", {
               active: active.bold,
            })}
            onClick={(e) => {
               // Prevent default to stop focus from being lost
               e.preventDefault();
               onSelect("bold");
            }}
         >
            <FaBold title="Bold" />
         </span>
         <span
            className={classNames("toolbar-icon", {
               active: active.italic,
            })}
            onMouseDown={(e) => {
               e.preventDefault();
               onSelect("italic");
            }}
         >
            <FaItalic title="Italic" />
         </span>
         <span
            className={classNames("toolbar-icon", {
               active: active.strikeout,
            })}
            onMouseDown={(e) => {
               e.preventDefault();
               onSelect("strikeout");
            }}
         >
            <FaStrikethrough title="Strikeout" />
         </span>
         <span
            className={classNames("toolbar-icon", {
               active: active.highlight,
            })}
            onMouseDown={(e) => {
               e.preventDefault();
               onSelect("highlight");
            }}
         >
            <FaHighlighter title="Highlight" />
         </span>
      </div>
   );
};

export default Toolbar;
