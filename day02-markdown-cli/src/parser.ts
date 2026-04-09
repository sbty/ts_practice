/**
 * 入力されたMarkdown文字列内の特定の記法を、HTMLタグに置換して返す
 * @param text パース対象のMarkdown文字列
 * @returns HTMLに変換された文字列
 */
export function parseMarkdown(text: string): string {
    // 1. '# ' で始まる行を <h1> に置換
    // (正規表現を用いて、行頭の#とそれに続く文字をキャプチャして置換)
    let html = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // 2. '**文字**' を <strong>文字</strong> に置換
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return html;
}
