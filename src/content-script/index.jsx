import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { getRawTranscript, getTranscriptHTML, getLangOptionsWithLink } from './transcript';

let oldHref = ""

window.onload = () => {
    const bodyList = document.querySelector("body");
    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (oldHref !== document.location.href && window.location.search.includes("v=")) {
                oldHref = document.location.href;
                console.log('injecting')
                if (document.getElementById('initial-div')) {
                    document.getElementById('initial-div').remove()
                }
                injectOverlay();
            }
        });
    });
    observer.observe(bodyList, { childList: true, subtree: true });
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
    const [url, setUrl] = useState(window.location.href);
    const [transcript, setTranscript] = useState({
        start: '',
        duration: '',
        text: ''
    });
    let searchParam = {}

    useEffect(() => {
        searchParam = getSearchParam(window.location.href)
        const langOptionsWithLink = getLangOptionsWithLink(searchParam.v);
        if (!langOptionsWithLink) {
            return;
        }
        langOptionsWithLink.then(async (res) => {
            // const rawTranscript = await getRawTranscript(res[0].link)
            if (res) {
                const transcriptHTML = await getTranscriptHTML(res[0].link, searchParam.v);
                setTranscript(transcriptHTML)

                waitForElm('.transcript-container').then(() => {
                    document.querySelector('.transcript-container').innerHTML = Array.from(transcriptHTML).map((obj, index) => {
                        return `
                        <div className='transcript-line'>
                            ${obj.text}
                        </div>
                    `
                    }).join("")
                })
            }
        }).then(() => {
            document.addEventListener("fullscreenchange", function (event) {
                if (document.fullscreenElement) {
                    document.getElementById('initial-div').style.display = "block"
                }
                else {
                    document.getElementById('initial-div').style.display = "none"

                }
            });
        })
    }, [url])

    waitForElm('copy-button').then(() => {
        var inputField = document.getElementById('copy-button');

        inputField.addEventListener('mouseover', function () {  
            inputField.focus();
        });
    })

    return (
        <div className='main-container'>
            <button id="copy-button" style={{ width: '100px', zIndex: '20000' }} onClick={() => copyTranscript(transcript, searchParam)}>COPYYYY</button>
            {/* <button onClick={() => sendToChatGPT(transcript)}>ChatGPTTT</button> */}
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

const copyTranscript = (transcript, searchParam) => {
    console.log('here')
    const fullTranscript = document.createElement('full-transcript')
    fullTranscript.innerHTML = Array.from(transcript).map((obj, index) => {
        return `${obj.text}`
    }).join(" ")
    let str = `https://www.youtube.com/watch?v=${searchParam.v}` + "\n" + document.title + "\n\n" + fullTranscript.innerHTML.replaceAll(/(\n|&nbsp;)/g, ' ')
    // navigator.clipboard.writeText(str);
}