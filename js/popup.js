// 起動させる時
const c_button = document.getElementById("convert");
const status_txt = document.getElementById("status");

c_button.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "convert" }, () => {
            if (chrome.runtime.lastError) { }
        });
    });
};

// メッセージを受信
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg["message"] == "status") {
        var status = msg["status"];
        status_txt.textContent = status
    }
});