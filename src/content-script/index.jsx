import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { getRawTranscript, getTranscriptHTML, getLangOptionsWithLink } from './transcript';


window.onload = () => {
    if (window.location.hostname === "www.youtube.com") {
        if (window.location.search !== "" && window.location.search.includes("v=")) {
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
                document.addEventListener("fullscreenchange", function (event) {
                    if (document.fullscreenElement) {
                        document.getElementById('initial-div').style.display = "block"
                    }
                    else {
                        document.getElementById('initial-div').style.display = "none"
                        // const element = document.getElementById("react-target");
                        // element.remove();
                    }
                });

            })
        }
    }
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
    const [transcript, setTranscript] = useState();
    useEffect(() => {
        const videoId = getSearchParam(window.location.href).v
        const langOptionsWithLink = getLangOptionsWithLink(videoId);
        if(!langOptionsWithLink){
            return;
        }
        langOptionsWithLink.then(async (res) => {
            // const rawTranscript = await getRawTranscript(res[0].link)
            const transcriptHTML = await getTranscriptHTML(res[0].link, videoId);
            console.log(transcriptHTML);
        });
    }, [window.location.href])
    return (
        <div className='main-container'></div>
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