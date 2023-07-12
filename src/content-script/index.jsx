import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { getRawTranscript, getTranscriptHTML, getLangOptionsWithLink } from './transcript';
import { Words } from './words';
let oldHref = ""
const words = Words();
window.onload = () => {
    // console.log('on load')
    if(window.location.hostname === "www.youtube.com"){
    const bodyList = document.querySelector("body");
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (oldHref !== document.location.href && window.location.search.includes("v=")) {
                oldHref = document.location.href;
                if (document.getElementById('initial-div')) {
                    document.getElementById('initial-div').remove()
                }
                injectOverlay();
            }
        });
    });
    observer.observe(bodyList, { childList: true, subtree: true });
    }
    if (window.location.hostname === "chat.openai.com") {
        if (document.getElementsByTagName("textarea")[0]) {
            document.getElementsByTagName("textarea")[0].focus();
            // If search query is "?ref=glasp"
            if (window.location.search === "?ref=test") {
                // get prompt from background.js
                chrome.runtime.sendMessage({ message: "getPrompt" }, (response) => {
                    
                    document.getElementsByTagName("textarea")[0].value = response.prompt;
                    if (response.prompt !== "") {
                        console.log(response)
                        document.getElementsByTagName("textarea")[0].focus();
                        document.getElementsByTagName("button")[document.getElementsByTagName("button").length-1].click();
                    }
                });
            }
        }
    }


}

const injectOverlay = () => {
    waitForElm('#player-wide-container').then(() => {
        document.querySelector('#player-wide-container').insertAdjacentHTML("afterBegin", `
            <div id="initial-div" style="display: none; overflow: hidden; position: absolute; z-index: 1111; right: 0">
                <div style="display: flex; justify-content: right;">
                    <div id="react-target" style="margin-top: 100px"></div>
                </div>
            </div>
        `)
        const root = ReactDOM.createRoot(document.getElementById('react-target'));
        root.render(<Overlay />)


    })
}

function waitForElm(selector) {

    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function Overlay() {

    waitForElm('copy-button').then(() => {
        var inputField = document.getElementById('copy-button');

        inputField.addEventListener('mouseover', function () {  
            inputField.focus();
        });
    })

    return (
        <div className='main-container'>
            <button id="copy-button" onClick={() => copyTranscript(transcript, searchParam, false)}>COPYYYY</button>
            <button onClick={() => sendToChatGPT(transcript, searchParam)}>ChatGPTTT</button>
            <div className='transcript-container'>
                {/* {Array.from(transcript).map((obj, index) => {
                return (
                <div className='transcript-line' key={index}>
                    {obj.text}
                </div>
                )
                })} */}
            </div>
        </div>
    )
}

function getSearchParam(str) {

    const searchParam = (str && str !== "") ? str : window.location.search;

    if (!(/\?([a-zA-Z0-9_]+)/i.exec(searchParam))) return {};
    let match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^?&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        index = /\?([a-zA-Z0-9_]+)/i.exec(searchParam)["index"] + 1,
        query = searchParam.substring(index);

    let urlParams = {};
    while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;

}

const sendToChatGPT = (transcript, searchParam) => {
    const prompt = copyTranscript(transcript, searchParam, true)
    setTimeout(() => {
        console.log(prompt)
        chrome.runtime.sendMessage({ message: "setPrompt", prompt: prompt });
        window.open("https://chat.openai.com/chat?ref=test", "_blank");
    }, 500);
}

const copyTranscript = (transcript, searchParam, get) => {
    const fullTranscript = document.createElement('full-transcript')
    fullTranscript.innerHTML = Array.from(transcript).map((obj, index) => {
        return `${obj.text}`
    }).join(" ")
    let str = `https://www.youtube.com/watch?v=${searchParam.v}` + "\n" + document.title + "\n\n" + "\"" + fullTranscript.innerHTML.replaceAll(/(\n|&nbsp;)/g, ' ') + "\""
    if(get){
        return str
    }
    navigator.clipboard.writeText(str);
}