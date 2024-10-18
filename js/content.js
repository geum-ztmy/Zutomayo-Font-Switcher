// これ -> https://qiita.com/Myuy973/items/36f5598c40477db4581a

import Kuroshiro from '../node_modules/kuroshiro/src/index.js';
import KuromojiAnalyzer from '../node_modules/kuroshiro-analyzer-kuromoji/src/index.js';

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg["message"] == "convert") {
        const startTime = performance.now();
        await convertText();
        await changeFont();
        const endTime = performance.now();
        const processingTime = ((endTime - startTime) / 1000).toFixed(2);
        sendStatus(`処理完了(処理時間: ${processingTime}秒)`)
    }
});

// 

// ひらがなにする
async function convertText() {
    try {
        await sendStatus("初期化中...");
        const kuroshiro = await initKuroshiro();
        await sendStatus("文字をひらがなに変換中...");

        const fontFace = new FontFace('ztmy_font', `url(${chrome.runtime.getURL('ZTMY_MOJI-R.otf')})`);
        document.fonts.add(fontFace);
















        const EXCEPTIONS = ["漢字", "保持したい文字"]; // 変換しない文字
        const elements = document.body.querySelectorAll('*');
        const totalElements = elements.length;

        // 非同期で各要素を処理
        const promises = Array.from(elements).map(async (element, i) => {
            // 目に見える文字だけを処理する
            if (shouldProcessElement(element)) {
                await sendStatus(`変換中...(${i + 1}/${totalElements})`);
                const originalText = element.textContent.trim();

                // 特定文字列をプレースホルダに置換
                let replacedText = applyPlaceholders(originalText, EXCEPTIONS);

                // 英文をカタカナに変換し、ひらがな化
                const kana = enToKana(replacedText);
                let hiraganaText = await kuroshiro.convert(kana, { to: "hiragana" });

                // プレースホルダを元の漢字に戻す
                hiraganaText = restorePlaceholders(hiraganaText, EXCEPTIONS);

                // テキストとフォントを更新
                element.textContent = hiraganaText;
                element.style.fontFamily = `'ztmy_font', ${element.style.fontFamily}`;
            }
        });

        // 全要素の変換が完了するまで待つ
        await Promise.all(promises);
        console.log("全ての変換が完了しました！");

        // 要素を処理するかの条件を判定
        function shouldProcessElement(element) {
            return (
                (element.children.length === 0 || hasSpecificTag(element)) &&
                element.offsetHeight > 0 &&
                element.textContent.trim() !== '' &&
                !element.textContent.trim().startsWith('<') &&
                !element.textContent.trim().includes('function') &&
                !element.closest('script, style, meta, link, noscript')
            );
        }

        // プレースホルダに置換する関数
        function applyPlaceholders(text, exceptions) {
            let replacedText = text;
            exceptions.forEach(exception => {
                replacedText = replacedText.replaceAll(exception, `{{${exception}}}`);
            });
            return replacedText;
        }

        // プレースホルダを元の漢字に戻す関数
        function restorePlaceholders(text, exceptions) {
            let restoredText = text;
            exceptions.forEach(exception => {
                restoredText = restoredText.replaceAll(`{{${exception}}}`, exception);
            });
            return restoredText;
        }




























        // const elements = document.body.querySelectorAll('*');
        // const totalElements = elements.length;
        // for (let i = 0; i < totalElements; i++) {
        //     let element = elements[i];

        //     // なんでif貫通するのか意味わからなかった時にデバッグした跡
        //     //
        //     // if (element.textContent.trim() !== '') {
        //     //     console.log("---------- ELEMENT START ----------");
        //     //     console.log("Checking element: ", element);
        //     // 
        //     //     console.log("Children length:", element.children.length);
        //     //     console.log("Has specific tag:", hasSpecificTag(element));
        //     //     console.log("Offset height:", element.offsetHeight);
        //     //     console.log("Text content:", element.textContent.trim());
        //     //     console.log("Starts with '<':", element.textContent.trim().startsWith("<"));
        //     //     console.log("Includes 'function':", element.textContent.trim().includes("function"));
        //     //     console.log("Closest script/style/meta/link/noscript:", element.closest('script, style, meta, link, noscript'));
        //     // }

        //     // 隠し文字(漢字)の処理をどうしましょうかという話

        //     // 目に見える文字を含む要素のみ
        //     if ((element.children.length === 0 || (hasSpecificTag(element))) &&
        //         element.offsetHeight > 0 &&
        //         element.textContent.trim() !== '' &&
        //         !element.textContent.trim().startsWith("<") &&
        //         !element.textContent.trim().includes("function") &&
        //         !element.closest('script, style, meta, link, noscript')) {

        //         // console.log("IFの中身だよ")

        //         // 要素の中身をひらがなに変換(隠し文字以外)
        //         await sendStatus(`変換中...(${i + 1}/${totalElements})`);
        //         var kana = enToKana(element.textContent.trim())
        //         var hiraganaText = await kuroshiro.convert(kana, { to: "hiragana" });
        //         element.textContent = hiraganaText;
        //         element.style.fontFamily = "'ztmy_font', " + element.style.fontFamily

        //         await new Promise(requestAnimationFrame);
        //     } else {
        //         // デバッグ用です
        //         // console.log("IFの外側だよ")
        //     }
        // }




    } catch (error) {
        console.log("error on convertText():", error);
    }
}

// 全体フォントの変更(これでとりあえずはOK)
async function changeFont() {
    sendStatus("フォントを変更中...");
    const fontFace = new FontFace('ztmy_font', `url(${chrome.runtime.getURL('ZTMY_MOJI-R.otf')})`);
    document.fonts.add(fontFace);
    const style = document.createElement('style');
    style.innerHTML = `* { font-family: ztmy_font !important; }`;
    document.head.appendChild(style);
}

// メッセージを送信
async function sendStatus(status) {
    try {
        await chrome.runtime.sendMessage({ message: "status", status: status });
    } catch (error) {
    }
}

// Kuroshiroの初期化
async function initKuroshiro() {
    const kuroshiro = new Kuroshiro();
    const analyzer = new KuromojiAnalyzer({
        dictPath: chrome.runtime.getURL("node_modules/kuromoji/dict")
    });
    await kuroshiro.init(analyzer);
    return kuroshiro;
}

// 指定タグの存在確認
const tagNames = new Set(['b', 'i', 'u', 's', 'q', 'br', 'em', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'tt', 'kbd', 'sub', 'sup', 'dfn', 'del', 'ins', 'big', 'bdi', 'var', 'cite', 'samp', 'span', 'font', 'code', 'abbr', 'mark', 'time', 'small', 'strong', 'acronym', 'address', 'blockquote']);
function hasSpecificTag(element) {
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        if (tagNames.has(children[i].tagName.toLowerCase())) {
            return true;
        }
    }
    return false;
}

// 苦渋の決断
function enToKana(text) {
    const map = {
        'A': 'えー', 'B': 'びー', 'C': 'しー', 'D': 'でぃー', 'E': 'いー', 'F': 'えふ', 'G': 'じー',
        'H': 'えいち', 'I': 'あい', 'J': 'じぇー', 'K': 'けー', 'L': 'える', 'M': 'えむ', 'N': 'えぬ',
        'O': 'おー', 'P': 'ぴー', 'Q': 'きゅー', 'R': 'あーる', 'S': 'えす', 'T': 'てぃー', 'U': 'ゆー',
        'V': 'ぶい', 'W': 'だぶりゅー', 'X': 'えっくす', 'Y': 'わい', 'Z': 'ぜっと',
        'a': 'えー', 'b': 'びー', 'c': 'しー', 'd': 'でぃー', 'e': 'いー', 'f': 'えふ', 'g': 'じー',
        'h': 'えいち', 'i': 'あい', 'j': 'じぇー', 'k': 'けー', 'l': 'える', 'm': 'えむ', 'n': 'えぬ',
        'o': 'おー', 'p': 'ぴー', 'q': 'きゅー', 'r': 'あーる', 's': 'えす', 't': 'てぃー', 'u': 'ゆー',
        'v': 'ぶい', 'w': 'だぶりゅー', 'x': 'えっくす', 'y': 'わい', 'z': 'ぜっと',
        '0': 'ぜろ', '1': 'いち', '2': 'に', '3': 'さん', '4': 'よん',
        '5': 'ご', '6': 'ろく', '7': 'なな', '8': 'はち', '9': 'きゅう'
    };

    return text.split('').map(char => map[char] || char).join('');
}