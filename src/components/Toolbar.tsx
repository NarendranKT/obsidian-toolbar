import {FaBold} from "react-icons/fa";
import {FaItalic, FaStrikethrough, FaHighlighter} from "react-icons/fa6";
import classNames from "classnames";
import {useState} from "react";

const Toolbar = () => {
   const [active, setActive] = useState({
      bold: false,
      italic: false,
      strikeout: false,
      highlight: false,
   });
   return (
      <div className="toolbar-container">
         <span
            className={classNames("toolbar-icon", {
               active: active.bold,
            })}
            onClick={(e) => {
               // Prevent default to stop focus from being lost
               e.preventDefault();
               //    onSelect("bold");
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
               //    onSelect("italic");
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
               //    onSelect("strikeout");
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
               //    onSelect("highlight");
            }}
         >
            <FaHighlighter title="Highlight" />
         </span>
      </div>
   );
};

export default Toolbar;
