"use strict";

// Avoid creating variables in global scope. Put our object in the outer scope
// via the function argument instead.
(function (exports) {

  function importThreadPaneColumnsModule() {
    try {
      // TB115
      return ChromeUtils.importESModule("chrome://messenger/content/thread-pane-columns.mjs");
    } catch (err) {
      // TB128
      return ChromeUtils.importESModule("chrome://messenger/content/ThreadPaneColumns.mjs");
    }
  }
  
  var { ThreadPaneColumns } = importThreadPaneColumnsModule();

  function getXOriginalHeaderValue(hdr) {
    // The desired header must be stored in the message database, which is
    // controlled by mailnews.customDBHeaders preference.
    // getStringProperty returns "" if nothing is found.
    return hdr.getStringProperty("x-original-to");
  }

  var OriginalToColumn = class extends ExtensionAPI {
    /**
     * Called when the extension is disabled, removed, reloaded, or Thunderbird closes.
     * @param {boolean} isAppShutdown
     */
    onShutdown(isAppShutdown) {
      if (isAppShutdown) return
      Services.obs.notifyObservers(null, 'startupcache-invalidate')
    }
  
    /**
     *
     * @param {*} context
     * @returns
     */
    getAPI(context) {
      context.callOnClose(this)
      return {
        OriginalToColumn: {
          /**
           * @param {string} name  - the name of the custom column
           * @param {string} tooltip - currently unsupported
           */
          async addColumn(name, tooltip) {
            ThreadPaneColumns.addCustomColumn("originalToColumn", {
              name: name,
              hidden: true,
              icon: false,
              resizable: true,
              sortable: true,
              textCallback: getXOriginalHeaderValue,
            });
          },
  
          async removeColumn() {
            ThreadPaneColumns.removeCustomColumn("originalToColumn");
          }
        }
      }
    }
  
    close() {
      ThreadPaneColumns.removeCustomColumn("originalToColumn");
    }
  }

  exports.OriginalToColumn = OriginalToColumn;
})(this);
