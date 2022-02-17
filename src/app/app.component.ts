import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, HostBinding } from '@angular/core';
import hljs from 'highlight.js';


function GetCursorPosition(context: any): number
{
  const selection = window.getSelection();
  if (!selection) return 0;
  const range = selection.getRangeAt(0);
  range.setStart(context, 0);
  return range.toString().length;
}

function setCursorPosition(context: any, len: number): void
{
  const selection = window.getSelection();
  if (!selection) return;
  const pos = getTextNodeAtPosition(context, len);
  selection.removeAllRanges();
  const r = new Range();
  r.setStart(pos.node, pos.position);
  selection.addRange(r);
}

function getTextNodeAtPosition(root: any, index: number): { node: any, position: number }
{
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT,
    {
      acceptNode: (elem: Node): number =>
      {
        const l = elem?.textContent?.length ?? 0;
        if (index > l)
        {
          index -= l;
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

  return { node: treeWalker.nextNode() ?? root, position: index };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit
{
  @ViewChild('code') public codeEditor!: ElementRef
  public cSharpCode = `
  /// <summary>
  /// Запрос чтения
  /// </summary>
  /// <param name="ctx">Контекст базы данных Entity</param>
  /// <returns>Авторы</returns>
  [UseProjection]
  [UseFiltering()]
  [UseSorting()]
  public IQueryable<Author> Read([Service] DemoContext ctx) =>
      ctx.Authors;
`;

  ngAfterViewInit(): void
  {
    this.codeEditor.nativeElement.innerHTML = hljs.highlight(this.cSharpCode, { language: 'csharp', ignoreIllegals: true }).value;

  }

  onInput(e: any): void
  {
    if (this.cSharpCode === this.codeEditor.nativeElement.textContent) return;

    this.cSharpCode = this.codeEditor.nativeElement.textContent;

    const position = GetCursorPosition(this.codeEditor.nativeElement);
    this.codeEditor.nativeElement.innerHTML = hljs.highlight(this.cSharpCode, { language: 'csharp', ignoreIllegals: true }).value;
    setCursorPosition(this.codeEditor.nativeElement, position);

  }

  onKeyDown(e: KeyboardEvent): void
  {
    if (e.key === 'Tab')
    {
      e.preventDefault();
      const s = GetCursorPosition(this.codeEditor.nativeElement);
      let txt = this.codeEditor.nativeElement.textContent as string;
      txt = txt.slice(0, s) + '    ' + txt.slice(s);
      this.codeEditor.nativeElement.innerHTML = hljs.highlight(txt, { language: 'csharp', ignoreIllegals: true }).value;
      setCursorPosition(this.codeEditor.nativeElement, s + 4);
    }
  }


  @HostBinding('style.--fw')
  public fw = 400;
}
