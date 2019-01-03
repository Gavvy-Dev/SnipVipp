let root = new Vue({
  el  : "#root",
  data: {
    trigger     : "",
    expansion   : "",
    yourSnippets: []
  },
  computed: {
    snippet() {
      let snippet = this.trigger.trim() + "=";
      let currChar = "";
      const replaceChars = {
        "\n" : "\\n"     ,
        "\t" : "\\t"     ,
        "|"  : "%cursor%",
        "%"  : "{pc}"
      };
      for (let i = 0, len = this.expansion.length; i < len; ++i) {
        currChar = this.expansion.charAt(i);
        snippet += replaceChars[currChar] || currChar;
      }

      return snippet;
    },
    isAnyFieldEmpty() {
      return this.trigger.length == 0 || this.expansion.length == 0;
    }
  },
  methods: {
    insertTab(e) {
      const startPos = e.target.selectionStart;
      const endPos   = e.target.selectionEnd;

      function restoreCaret(dispalcement = 1) {
        dispalcement = dispalcement == 0 ? 1 : dispalcement;
        // This setTimeout is to monkeypatch a bug Vue's current stable version has
        setTimeout(() => {
          e.target.selectionStart = startPos + 1;
          e.target.selectionEnd   = endPos + dispalcement;
        }, 10);
      }

      // If there is no selected text
      if (startPos === endPos) {
        const textBefore = this.expansion.substr(0, startPos);
        const textAfter  = this.expansion.substr(startPos);
        
        this.expansion = `${textBefore}\t${textAfter}`;
        restoreCaret();

      } else {
        let expansion = this.expansion;

        // To find all the occurences of newlines
        let   lines            = expansion.split('\n');
        let   count            = 0;
        let   newlinePositions = lines.map(l => count += l.length, count);
        const startLine        = newlinePositions.findIndex(p => p > startPos);
        const endLine          = newlinePositions.findIndex(p => p > endPos);

        for (let i = startLine; i <= endLine; ++i)
          lines[i] = "\t" + lines[i];
        console.log(startLine, endLine);
        this.expansion = lines.join("\n");
        restoreCaret(endLine - startLine + 1);
      }
    },
    addToYourSnippets() {
      const snippet = this.snippet.trim();
      if (this.isAnyFieldEmpty) return alert('Please enter a snippet first!');
      this.yourSnippets.push(this.snippet.trim());
      this.trigger = this.expansion = "";
    },
    copySnippet() {
      copyToClipboard(this.snippet);
    },
    copyAllYourSnippets() {
      copyToClipboard(this.yourSnippets.join('\n'));
    },
    stripOffTrailingSpaces() {  
      let lines = this.expansion.split('\n');
      lines = lines.map( line => line.replace(/\s+$/g, ''));
      this.expansion = lines.join('\n') + '\n';
    }
  },
  filters: {
    limitText: (text, upto = 50) => text.length > upto ? text.substr(0, upto) + "..." : text
  }
});

function copyToClipboard(textContent) {
  const tempTextarea = document.createElement('textarea');
  document.getElementsByTagName('body')[0].appendChild(tempTextarea);
  tempTextarea.value = textContent;
  tempTextarea.select();
  document.execCommand('copy');
  tempTextarea.remove();
}