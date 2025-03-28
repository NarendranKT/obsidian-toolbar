import {Plugin, MarkdownView, Workspace} from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Toolbar from "src/components/Toolbar";

export default class SelectionPopoverPlugin extends Plugin {
   private rootContainer: HTMLElement | null = null;
   private root: ReactDOM.Root | null = null;

   async onload() {
      console.log("Loading Selection Popover plugin");

      // Unmounts root when switching to a different view from 'markdown'
      this.app.workspace.on("active-leaf-change", () => {
         const leaf = this.app.workspace.getMostRecentLeaf();
         const view = leaf!.view.getViewType();
         if (view !== "markdown") {
            this.root?.unmount();
            this.rootContainer?.remove();
         }
      });

      // Unmounts root when switching to different mode from 'source'
      this.app.workspace.on("layout-change", () => {
         const leaf = this.app.workspace.getMostRecentLeaf();
         if (leaf?.view instanceof MarkdownView) {
            const mode = leaf.view.getMode();
            if (mode === "source") {
               // Create a container for our React component
               this.rootContainer = document.createElement("div");
               this.rootContainer.classList.add("root");
               document.body.appendChild(this.rootContainer);

               // Create the React root
               this.root = ReactDOM.createRoot(this.rootContainer);
            } else {
               this.root?.unmount();
               this.rootContainer?.remove();
            }
         }
      });

      // Register an event to listen for text selection
      this.registerDomEvent(document, "selectionchange", () => {
         this.handleSelectionChange();
      });
   }

   onunload() {
      console.log("Unloading Selection Popover plugin");
      if (this.root) {
         this.root.unmount();
      }
      if (this.rootContainer) {
         this.rootContainer.remove();
      }
   }

   private handleSelectionChange() {
      const selection = window.getSelection();

      // Hide popover if no selection
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
         this.hidePopover();
         return;
      }

      // Make sure we're in an editor
      const activeLeaf = this.app.workspace.activeLeaf;
      if (!activeLeaf || !(activeLeaf.view instanceof MarkdownView)) {
         return;
      }

      // Get selection position for popover placement
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Show popover
      this.showPopover(this.app.workspace, rect);
   }

   private showPopover(workspace: Workspace, position: DOMRect) {
      if (!this.rootContainer || !this.root) return;

      // Position the popover above the selection
      this.rootContainer.style.display = "block";

      // Render React component first to get the correct dimensions
      this.root.render(React.createElement(React.StrictMode, null, React.createElement(Toolbar, {workspace})));

      // Now position the popover after rendering
      // Use setTimeout to ensure the component has rendered
      setTimeout(() => {
         if (this.rootContainer) {
            this.rootContainer.style.top = `${position.top - 10 - this.rootContainer.offsetHeight}px`;
            this.rootContainer.style.left = `${position.left + position.width / 2 - this.rootContainer.offsetWidth / 2}px`;
         }
      }, 0);
   }

   private hidePopover() {
      if (this.rootContainer) {
         this.rootContainer.style.display = "none";
      }
   }
}
