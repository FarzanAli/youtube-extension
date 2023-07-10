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
                if(document.getElementById('initial-div')){
                    document.getElementById('initial-div').remove()
                }
                injectOverlay();
            }
        });
    });
    observer.observe(bodyList, { childList: true, subtree: true });
}

const injectOverlay = () => {
    waitForElm('.html5-video-container').then(() => {
        document.querySelector('.html5-video-container').insertAdjacentHTML("beforeend", `
            <div id="initial-div" style="display: none; overflow: hidden; position: absolute; z-index: 1111; width: 100vw; height: 100vh; right: 0">
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

    useEffect(() => {
        const videoId = getSearchParam(window.location.href).v
        const langOptionsWithLink = getLangOptionsWithLink(videoId);
        if (!langOptionsWithLink) {
            return;
        }
        langOptionsWithLink.then(async (res) => {
            // const rawTranscript = await getRawTranscript(res[0].link)
            if (res) {
                const transcriptHTML = await getTranscriptHTML(res[0].link, videoId);
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

    return (
        <div className='main-container'>
            <button onClick={() => copyTranscript(transcript)}>COPYYYY</button>
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

const copyTranscript = (transcript) => {
    const fullTranscript = document.createElement('full-transcript')
    fullTranscript.innerHTMsL = Array.from(transcript).map((obj, index) => {
        return `${obj.text}`
    }).join("")
    let str = fullTranscript.innerHTML.replaceAll(/(\n|&nbsp;)/g, ' ')
}